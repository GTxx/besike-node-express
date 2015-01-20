function makeRoute(verb, handler){
  return function(req, res, next){
    verb = verb.toUpperCase();
    if (req.method== verb) {
      handler(req, res, next);
    } else {
      next();
    }
  }
}
module.exports = makeRoute