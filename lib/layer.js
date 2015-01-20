var p2re = require('path-to-regexp');

function Layer(url, handle, options){
  this.url = url;
  this.handle = handle;
  var name = []
  if (url[url.length-1] == '/'){
    url = url.slice(0, url.length-1);
  }
  options = options || {end: false};
  var url_re = p2re(url, name, options);
  this.url_re = {re: url_re, params: name};
}

Layer.prototype.match = function(url){
  var re = this.url_re.re
  var re_params = this.url_re.params
  var res = re.exec(decodeURI(url));
  if (res){
    var params = {}
    for (var i = 0; i < re_params.length; i++){
      params[re_params[i]['name']] = res[i+1];
    }
    return {
      path: res[0],
      params: params
    }
  } else {
    return undefined
  }
  //return url.indexOf(this.url) == 0 ? {path: this.url} : undefined;
}

module.exports = Layer