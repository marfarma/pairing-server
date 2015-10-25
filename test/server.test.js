

// test/server.test.js
var assert = require("chai").assert;
var http   = require("http");
var server = require("../server");

var app = server(); //jshint ignore:line

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