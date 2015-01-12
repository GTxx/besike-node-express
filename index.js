var http = require('http');


function myexpress(){

  function app(req, res, next) {
    app.handler(req, res, next);
  }
  app.handler = function(req, res, next) {
    var stack_idx = 0;
    var stack = this.stack;

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
    var done = next || finalhandler(req, res, {
        env: env,
        onerror: logerror
      });

    function next(err) {
      stack_idx++;
      var hasError = Boolean(err);
      var handler = stack[stack_idx - 1];

      if (!handler) {
        // subapp's finalHandler will be called later
        setImmediate(finalHandler, err, req, res)
        return;
      }
      try {
        if (hasError && handler.length == 4) {
          // hasError and handler is function(err, req, res, next)
          return handler(err, req, res, next);
        } else if (!hasError && handler.length == 3) {
          // has no error and handler is function(req, res, next)
          return handler(req, res, next);
        }
      } catch (e) {
        err = e;
      }
      next(err)
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
    //if (func instanceof app){
    //  var subapp = func;
    //  func = function(req, res, next){
    //    subapp.handler(req, res, next)
    //  }
    //}
    this.stack.push(func)
    // support chain call, like app.use(fn1).use(fn2)...
    return this;
  }

  return app;
}

module.exports = myexpress;