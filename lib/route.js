var methods = require('methods');

function makeRoute(){

  // route is a handler to myexpress
  var route = function(req, res, app_next){
    var stack_idx = 0;
    var stack = route.stack;

    function next(err){
      if (err instanceof Error){
        app_next(err);
      } else if (err == 'route'){
        app_next();
      } else {
        var verb_handler = stack[stack_idx];
        stack_idx = stack_idx + 1;

        if (verb_handler) {
          var verb = verb_handler.verb.toUpperCase();
          var handler = verb_handler.handler;
          if (verb == 'ALL' || verb == req.method) {
            handler(req, res, next)
          } else {
            next()
          }
        } else {
          app_next();
        }
      }
    }
    next();
  };

  route.stack =[];
  route.use = function(verb, handler){
    route.stack.push({verb: verb, handler: handler})
  }

  methods.forEach(function(method){
    route[method] = function(handler){
      route.use(method, handler);
      return this;
    }
  })
  route.all = function(handler){
    route.use('all', handler);
    return this;
  }
  return route;
}
module.exports = makeRoute