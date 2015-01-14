var http = require('http')
  , Layer = require('./lib/layer');


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
      var layer = stack[stack_idx-1]

      if (!layer){
        if(!out_next){
          finalHandler(err, req, res)
          return
        } else {
          // handler is a subapp,
          out_next(err);
          return
        }
      } else {
        var handle = layer.handle;
        if (layer.match(req.url)) {
          try {
            if (hasError && isErrorHandle(handle)) {
              // hasError and handler is function(err, req, res, next)
              handle(err, req, res, next);
              return
            } else if (!hasError && !isErrorHandle(handle)) {
              // has no error and handler is function(req, res, next)
              handle(req, res, next);
              return
            }
          } catch (e) {
            err = e;
          }
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

  app.use = function(url, func){
    if (typeof url != 'string') {
      func = url;
      url = '/'
    }
    if ('function' == typeof func.handler){
      var subapp = func;
      func = function(req, res, next){
        subapp.handler(req, res, next)
      }
    }
    layer = new Layer(url, func)
    this.stack.push(layer)
    // support chain call, like app.use(fn1).use(fn2)...
    return this;
  }

  return app;
}

function isErrorHandle(handler){
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