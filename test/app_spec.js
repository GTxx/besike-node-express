var express = require('../')
  , request = require('supertest')
  , expect = require('chai').expect
  , http = require('http');

describe('Implement Empty App', function(){
  var app = express();

  it("express should return a function", function(){
    expect(app).to.be.a('function');
  });

  describe('as handler to http.createServer', function(){
    var server = http.createServer(app);
    it("respond to /foo with 404", function(done){
      request(server).get('/foo').expect(404).end(done);
    })
  })

  describe('Defining the app.listen method', function(){
    var server = app.listen(4000);

    it('should return an http.Server', function(){
      expect(server).to.be.instanceof(http.Server);
    })

    it("responds to /foo with 404", function(done){
      request("http://localhost:4000").get('/foo').expect(404).end(done);
    })
  })
});

describe('Implement app.use', function(){
  var app = express();

  it("should be able to add middlewares to stack", function(){
    var m1 = function(){};
    var m2 = function(){};
    app.use(m1);
    app.use(m2);
    expect(app.stack).to.be.eql([m1, m2])
  })
})

describe('Implement calling the middleware', function(){
  var app;
  beforeEach(function(){
    app = new express();
  })

  it('should be able to call single middleware', function(done){
    var m1 = function(req, res, next){
      res.end('hello from m1');
    }
    app.use(m1);
    request(app).get('/').expect('hello from m1').end(done);
  })

  it('should be able to call next to go to the next middleware', function(done){
    var m1 = function(req, res, next){next();}
    var m2 = function(req, res, next){
      res.end("hello from m2");
    }
    app.use(m1);
    app.use(m2);
    request(app).get('/').expect('hello from m2').end(done);
  })

  it('should 404 at the end of middleware chain', function (done){
    var m1 = function(req, res, next){ next(); }
    var m2 = function(req, res, next){ next(); }
    app.use(m1);
    app.use(m2);
    request(app).get('/').expect('404 - Not Found').end(done);
  })

  it('Should 404 if no middleware is added', function(done){
    request(app).get('/').expect('404 - Not Found').end(done);
  })

})

describe('Implement Error Handling', function(){
  var app;
  beforeEach(function(){
    app = express();
  })
  it('should return 500 for unhandled error', function(done){
    var m1 = function(req,res,next) {
      next(new Error("boom!"));
    }
    app.use(m1);
    request(app).get('/').expect('500 - Internal Error').end(done);
  })
})