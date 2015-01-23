var http = require('http');

var proto = {
  redirect : function(statusCode, url){
    if(!url){
      url = statusCode
      statusCode = '302';
    }
    this.writeHead(statusCode, {Location: url, 'Content-Length': 0})
    this.end('');
  }
};
proto.isExpress = true;
proto.__proto__ = http.ServerResponse.prototype;

module.exports = proto;