var http = require('http')
  , mime = require('mime')
  , accepts = require('accepts');

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
  }
};
proto.isExpress = true;
proto.__proto__ = http.ServerResponse.prototype;

module.exports = proto;