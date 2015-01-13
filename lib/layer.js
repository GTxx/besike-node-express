function Layer(url, middleware){
  this.url = url;
  this.middleware = middleware;
}

Layer.prototype.match = function(url){
  return url == this.url ? {path: url} : undefined;
}

module.exports = Layer