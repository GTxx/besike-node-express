var http = require('http');
var finalhandler = require('finalhandler')


function myexpress(){

  function app(req, res) {
    app.handler(req, res);
  }

  app.handler = function(req, res, out_next) {
    var stack_idx = 0;
    var stack = this.stack;

    function next(err) {
      stack_idx++;
      var hasError = Boolean(err);
      var handler = stack[stack_idx - 1];

      if (!handler){
        if(!out_next){
          finalHandler(err, req, res)
          return
        } else {
          // handler is a subapp,
          out_next(err);
          return
        }
      } else {
        try {
          if (hasError && isErrorHandler(handler)) {
            // hasError and handler is function(err, req, res, next)
            handler(err, req, res, next);
            return
          } else if (!hasError && !isErrorHandler(handler)) {
            // has no error and handler is function(req, res, next)
            handler(req, res, next);
            return
          }
        } catch (e) {
          err = e;
        }
        next(err)
      }
    }
    next();
  }

  app.listen = function(){
    var server = http.createServer(this);
    return server.listen.apply(server, arguments);
  }


  var stack = []
  app.stack = stack;

  app.use = function(func){
    if ('function' == typeof func.handler){
      var subapp = func;
      subapp.is_subapp = true;
      func = function(req, res, next){
        subapp.handler(req, res, next)
      }
    }
    this.stack.push(func)
    // support chain call, like app.use(fn1).use(fn2)...
    return this;
  }

  return app;
}

function isErrorHandler(handler){
  return handler.length == 4;
}

function finalHandler(err, req, res){
  var hasError = Boolean(err);
  if (!hasError){
    res.statusCode = 404;
    res.end('404 - Not Found');
  } else {
    res.statusCode = 500;
    res.end('500 - Internal Error');
  }
}

module.exports = myexpress;