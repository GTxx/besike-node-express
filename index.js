var http = require('http');

function myexpress(){
  function app(req, res){
    function createNext(){
      var stack_idx = 0;
      var self = this;
      function next(){
        if (self.stack[stack_idx]) {
          stack_idx += 1;
          return self.stack[stack_idx-1](req, res, next);
        } else {
          res.end("404 NOT FOUND")
        }
      }
      return next;
    }
    var next = createNext();
    next();
    //res.writeHead(404)
    //res.end('Not Found');
  };

  app.listen = function(){
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }
  app.stack = [];
  app.use = function(func){
    this.stack.push(func)
  }
  return app;
}

module.exports = myexpress;