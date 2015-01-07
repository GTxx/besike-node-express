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