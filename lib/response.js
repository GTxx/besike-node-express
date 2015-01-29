var http = require('http')
  , mime = require('mime')
  , accepts = require('accepts')
  , crc32 = require('buffer-crc32')
  , fs = require('fs')
  , path = require('path');

var proto = {
  redirect : function(statusCode, url){
    if(!url){
      url = statusCode
      statusCode = '302';
    }
    this.writeHead(statusCode, {Location: url, 'Content-Length': 0})
    this.end('');
  },
  type: function(ext){
    this.setHeader('Content-Type', mime.lookup(ext))
  },
  default_type: function(ext){
    var contentType = this.getHeader('Content-Type');
    if (!contentType){
      this.setHeader('Content-Type', mime.lookup(ext));
    }
  },
  format: function(args){
    var formatList = Object.keys(args);
    var accept = accepts(this.req);
    var key = accept.types(formatList);
    if (args[key]){
      this.type(key);
      args[key]();
    } else {
      var err = new Error('Not Acceptable');
      err.statusCode = 406;
      throw err;
    }
  },
  send: function(statusCode, obj){

    var lastModified = this.getHeader('Last-Modified');
    var if_modified_since = this.req.headers['if-modified-since'];

    if (lastModified && if_modified_since){
      lastModified = new Date(lastModified);
      if_modified_since = new Date(if_modified_since)
      if (lastModified <= if_modified_since){
        this.statusCode = 304;
        this.end();
      }
    }
    if (!obj){
      if (typeof(statusCode) == "number"){
        obj = http.STATUS_CODES[statusCode.toString()]
      } else {
        obj = statusCode;
        statusCode = 200;
      }
    }
    this.statusCode = statusCode;
    var contentLength = Buffer.byteLength(obj);
    this.setHeader('Content-Length', contentLength);
    var contentType = this.getHeader('Content-Type');

    if (this.req.method == 'GET' && obj){
      var Etag = this.getHeader('ETag')
      if (!Etag){
        this.setHeader('ETag', crc32.unsigned(obj));
      }

    }

    // if etag equal request.headers.if-none-match, return 304
    var Etag = this.getHeader('ETag')
    if (Etag){
      var if_not_match = this.req.headers['if-none-match'];
      if (if_not_match && if_not_match == Etag) {
        this.statusCode = 304;
        this.end();
        return;
      }
    }

    if (contentType){
      this.end(obj);
      return;
    }
    if(obj instanceof Buffer){
      this.setHeader('Content-Type', 'application/octet-stream');
      this.end(obj);
      return;
    } else if(obj instanceof Object){
      this.setHeader('Content-Type', 'application/json');
      this.end(JSON.stringify(obj));
      return;
    } else {
      this.type('html');
      this.end(obj);
      return;
    }
  },

  stream: function(file){
    var res = this;
    file.on("data", function(chunk){
      var ok = res.write(chunk);
      if(ok == false){
        file.pause();
        res.once('drain', function(){
          file.resume();
        })
      }
    });

    file.on('end', function(){
      res.end();
    });
  },

  sendfile: function(filePath, options){
    if(options && options['root']){
      filePath = path.normalize(options['root']+filePath)
    }
    var stream = fs.createReadStream(filePath)
    this.stream(stream);
  }

};

proto.isExpress = true;
proto.__proto__ = http.ServerResponse.prototype;

module.exports = proto;