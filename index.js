var http = require('http');
function myexpress(){
  function app(req, res, next){
    res.writeHead(404)
    res.end('Not Found');
  };
  app.listen = function(){
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }
  return app;
}

module.exports = myexpress;