// test/server.test.js
/*jshint -W030 */
var chai   = require('chai');
var assert = require("chai").assert;
var should = require("chai").should(); //jshint ignore:line
var http   = require("http");
var fs     = require('fs');
var server = require("../server");
var app;

process.setMaxListeners(0);

function existsSync(filename) {
  try {
    fs.accessSync(filename);
    return true;
  } catch(ex) {
    return false;
  }
}

describe('server tests', function(){

  beforeEach(function(done) {
    server(function(err, server) {
      if (err) { throw err; }
      app = server;
      done();
    }); //jshint ignore:line
  });

  afterEach(function(done) {
    if (app) {
      app.close( function () {
        done();
      });
    }
    else {
      console.log('app doesnt exist server tests afterEach');
      done();
    }
  });


  it("should return a 200 response on a valid set", function (done) {
      http.get("http://localhost:4000/set?color=blue", function (res) {
          assert.equal(res.statusCode, 200);
          done();
      });
  });

  it("should return a 200 response on a valid get", function (done) {
      http.get("http://localhost:4000/get?key=color", function (res) {
          assert.equal(res.statusCode, 200);
          done();
      });
  });

  it("should return expected value for a valid get", function (done) {

      http.get("http://localhost:4000/get?key=color", function (res) {
          var chunks = [];
          res.on("data", function (data) {
              chunks.push(data);
          }).on("end", function () {
              assert.isTrue(chunks.join("").indexOf("blue") > -1);
              done();
          });
      });
  });

  it("should return a 404 response on an invalid get key", function (done) {
      http.get("http://localhost:4000/get?key=colorx", function (res) {
          assert.equal(res.statusCode, 404);
          done();
      });
  });

  it("should return a 400 response on get with an invalid query string", function (done) {

      http.get("http://localhost:4000/get", function (res) {
          assert.equal(res.statusCode, 400);
          done();
      });
  });

  it("should return a 400 response on set with an invalid query string", function (done) {

      http.get("http://localhost:4000/set", function (res) {
          assert.equal(res.statusCode, 400);
          done();
      });
  });

  it("should return a 400 response on an invalid path", function (done) {

      http.get("http://localhost:4000/xxset", function (res) {
          assert.equal(res.statusCode, 400);
          done();
      });
  });

  it("should return a 400 response on wrong number of query params", function (done) {

      http.get("http://localhost:4000/set?color=blue&height=500", function (res) {
          assert.equal(res.statusCode, 400);
          done();
      });
  });

  it("should return a 400 response on get missing key parameter", function (done) {

      http.get("http://localhost:4000/get?keyzz=color", function (res) {
          assert.equal(res.statusCode, 400);
          done();
      });
  });

});




describe('cache file tests', function(){

  afterEach(function(done) {
    if (app) {
      app.close( function () {
        done();
      });
    }
    else {
      console.log('app doesnt exist - file tests afterEach');
      done();
    }
  });

  after(function(done) {
    if (app) {
      app.close( function () {
        done();
      });
    }
    else {
      console.log('app doesnt exist - file tests after');
      done();
    }
  });


  beforeEach(function(done){
    if (existsSync('./cache.json')) {
      fs.unlinkSync('./cache.json');
    }
    done();
  });


  it('should handle an empty cache file', function(done) {

    fs.writeFileSync('./cache.json', '', 'utf8');
    server(function(err, server) {
      chai.should(err).empty;
      app = server;
      done();
    });
  });

  it('should read existing cache file', function(done) {

    fs.writeFileSync('./cache.json', '{"color":"blue","light":"black"}', 'utf8');
    server(function(err, server) {
      chai.should(err).empty;
      app = server;

      http.get("http://localhost:4000/get?key=light", function (res) {
        var chunks = [];
        res.on("data", function (data) {
            chunks.push(data);
        }).on("end", function () {
            assert.isTrue(chunks.join("").indexOf("black") > -1);
            done();
        });
      });
//      done();
    });
  });

  it('should create a cache file if missing', function(done) {
    server(function(err, server) {
      chai.should(err).empty;
      app = server;
      server.close(function() {
        fs.existsSync('./cache.json').should.be.true;
        done();
      });
    });
  });
});

