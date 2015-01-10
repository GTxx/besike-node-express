var http = require('http');

function myexpress(){

  function app(req, res){
    function createNext(){
      var process_stack_idx = 0;
      var error_stack_idx = 0;

      function next() {
        console.log(arguments)
        if (arguments.length == 1) {
          // error process
          error_stack_idx += 1;
          return error_stack[error_stack_idx - 1](arguments[0], req, res, next);
        }
        if (arguments.length == 0) {
          process_stack_idx += 1;
          try {
            return process_stack[process_stack_idx - 1](req, res, next);
          } catch (e) {
            next(e);
          }
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

  function not_found_handler(req, res, next){
    res.end("404 - Not Found")
  }

  function default_error_handler(err, req, res, next){
    // return 500 by default
    res.end('500 - Internal Error');
  }
  var error_stack = [default_error_handler]
  var process_stack = [not_found_handler]

  //app.stack = stack;

  app.use = function(func){
    if (func.length == 3){
      process_stack[process_stack.length-1] = func
      process_stack.push(not_found_handler)
    }
    if (func.length == 4){
      error_stack[error_stack.length-1] = func
      error_stack.push(default_error_handler)
    }
  }

  return app;
}

module.exports = myexpress;