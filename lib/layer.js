function Layer(url, handle){
  this.url = url;
  this.handle = handle;
}

Layer.prototype.match = function(url){
  return url.indexOf(this.url) == 0 ? {path: this.url} : undefined;
}

module.exports = Layer