var http = require('http')
  , Layer = require('./lib/layer')
  , makeRoute = require('./lib/route')
  , methods = require('methods');


function myexpress(){

  function app(req, res) {
    // support app(req, res, next)
    app.handle(req, res);
  }

  app.handle = function(req, res, out_next) {
    var stack_idx = 0;
    var stack = app.stack;

    function next(err) {
      stack_idx++;
      var hasError = Boolean(err);
      var layer = stack[stack_idx-1]

      if (!layer){
        if(!out_next){
          finalHandler(err, req, res)
          return
        } else {
          // handle is a subapp,
          req.url = req.trim_url + req.url;
          out_next(err);
          return
        }
      }
      var handle = layer.handle;
        var url_match = layer.match(req.url);
        if (url_match) {
          req.params = url_match.params;

          try {
            if (hasError && isErrorHandle(handle)) {
              // hasError and handle is function(err, req, res, next)
              handle(err, req, res, next);

            } else if (!hasError && !isErrorHandle(handle)) {
              // has no error and handle is function(req, res, next)
              handle(req, res, next);

            }

          } catch (e) {
            err = e;
          }
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

  app.use = function(url, func, options){
    if (typeof url != 'string') {
      func = url;
      url = '/'
    }
    if ('function' == typeof func.handle){
      var subapp = func;
      func = function(req, res, next){
        req.url = req.url.split(url)[1];
        req.trim_url = url;
        subapp.handle(req, res, next)
      }
    }
    var layer = new Layer(url, func, options)
    this.stack.push(layer)
    // support chain call, like app.use(fn1).use(fn2)...
    return this;
  }

  //app.get = function(path, handler){
  //  app.use(path, makeRoute('get', handler), {'end': true});
  //}
  methods.forEach(function(method){
    app[method] = function(path, handler){
      app.use(path, makeRoute(method, handler), {'end': true});
    }
  })


  return app;
}

function isErrorHandle(handle){
  return handle.length == 4;
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