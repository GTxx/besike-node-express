var http = require('http')
  , Layer = require('./lib/layer');


function myexpress(){

  function app(req, res) {
    app.handle(req, res);
  }

  app.handle = function(req, res, out_next) {
    var stack_idx = 0;
    var stack = this.stack;
    req.params = {};
    function next(err) {
      stack_idx++;
      var hasError = Boolean(err);
      var layer = stack[stack_idx-1]

      if (!layer){
        console.log('no layer left')
        if(!out_next){
          console.log('not subapp')
          finalHandler(err, req, res)
          return
        } else {
          // handle is a subapp,
          out_next(err);
          return
        }
      } else {
        var handle = layer.handle;
        console.log(handle)
        console.log('req.url is '+req.url)
        var url_match = layer.match(req.url);
        console.log('url_mathch is '+url_match)
        if (url_match) {
          if ('function' == typeof handle.handle) {
            console.log('req.url: ' + req.url)
            console.log('layer.url: '+layer.url)
            req.url = req.url.split(layer.url)[1];
            console.log('after strip, req.url: '+req.url)
          }
          req.params = url_match.params;
          console.log('req.params is '+req.params)
          try {
            if (hasError && isErrorHandle(handle)) {
              // hasError and handle is function(err, req, res, next)
              console.log('handle error')
              handle(err, req, res, next);
              if ('function' == typeof layer.handle.handle) {
                req.url = layer.url + req.url;
                console.log('restore req.url: '+req.url)
              }
              return
            } else if (!hasError && !isErrorHandle(handle)) {
              // has no error and handle is function(req, res, next)
              console.log('handle normal')
              console.log('--------------')
              handle(req, res, next);
              if ('function' == typeof layer.handle.handle) {
                req.url = layer.url + req.url;
                console.log('restore req.url: '+req.url)
              }
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
    if ('function' == typeof func.handle){
      //var subapp = func;
      //func = function(req, res, next){
      //  subapp.handle(req, res, next)
      //}
    }
    var layer = new Layer(url, func)
    this.stack.push(layer)
    // support chain call, like app.use(fn1).use(fn2)...
    return this;
  }

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