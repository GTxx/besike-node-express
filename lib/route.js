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
        console.log(stack)

        if (verb_handler) {
          console.log(verb_handler)
          var verb = verb_handler.verb.toUpperCase();
          var handler = verb_handler.handler;
          console.log(verb)
          console.log(req.method)
          console.log(verb == req.method)
          console.log('should process this handler')
          if (verb == 'ALL' || verb == req.method) {
            console.log('process this handler')
            handler(req, res, next)
          } else {
            next()
          }
        } else {
          console.log('no verb_handler, go to app next')
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

  return route;
}
module.exports = makeRoute