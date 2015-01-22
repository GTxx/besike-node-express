function makeRoute(verb, handler){
  var route = function(req, res, next){
    verb = verb.toUpperCase();
    if (req.method== verb) {
      handler(req, res, next);
    } else {
      next();
    }
  };

  route.stack =[];
  route.use = function(verb, handler){
    route.stack.push({verb: verb, handler: handler})
  }

  return route;
}
module.exports = makeRoute