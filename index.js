var http = require('http');

function myexpress(){



  function app(req, res){

    function createNext(){
      var stack_idx = 0;
      function next(){
        if (stack[stack_idx]) {
          stack_idx += 1;
          return stack[stack_idx-1](req, res, next);
        } else {
          res.end("404 - Not Found")
        }
      }
      return next;
    }
    var next = createNext();
    next();
    //res.writeHead(404)
    //res.end('Not Found');
  }

  app.listen = function(){
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }

  function error_handler(err, res, req, next){
    res.end('500 - Internal Error');
  }
  var stack = []
  app.stack = stack;

  app.use = function(func){
    stack.push(func)
  }

  return app;
}

module.exports = myexpress;