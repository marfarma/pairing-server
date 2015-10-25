#!/usr/bin/env node

/*jshint -W069 */
'use strict';

var http = require('http');
var url = require('url') ;
var isObject = require('util').isObject;
var cache = {};

module.exports = function () {
  // copied from node util - indicated private
  // var extend = require('util')._extend;
  function extend(origin, add) {
    // Don't do anything if add isn't an object
    if (!add || !isObject(add)) {return origin;}

    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  }

  function propCount(obj) {
    var count = 0;
    for (var k in obj) {
      if (obj.hasOwnProperty(k)) {
         ++count;
      }
    }
    return count;
  }

  function badRequest(res) {
    res.writeHead(400);
    res.end('Bad Request');
  }

  function notFound(res) {
    res.writeHead(404);
    res.end('Not Found');
  }

  function getValue(res, key) {
    res.writeHead(200);
    res.end(cache[key]);
  }

  function setValue(res, query) {
    cache = extend(cache, query); 
    res.writeHead(200);
    res.end('Ok');
  }
//Object.getOwnPropertyNames(json).length
  // extra validations for get requests
  function isValidGetRequest(res, query) {
    if (!query.hasOwnProperty('key')) { 
      // query string missing required param
      badRequest(res);
      return false;
    }
    if ( !cache.hasOwnProperty( query['key']) ) {
      notFound(res);
      return false;
    }
    return true;
  }

  // validations in common for get & set
  function isValidRequest(res, urlObject) {
    if (urlObject.pathname.length !== 4) {
      badRequest(res);
      return false;
    } else if ( propCount(urlObject.query) !== 1) {
      // /set and /get each require a single query parm
      badRequest(res);
      return false;
    }
    return true;
  }

  function requestListener(req, res) {
    var urlObject = url.parse(req.url.toLowerCase(),true,true);
    //console.log(urlObject);

    if (isValidRequest(res, urlObject)){
      if (urlObject.pathname === '/set') {
        setValue(res, urlObject.query);
      }

      if (urlObject.pathname === '/get') {
        if (isValidGetRequest(res, urlObject.query)) {
          getValue(res, urlObject.query['key']);
        }
      }

    }
  }

  return http.createServer(requestListener).listen(4000, function() {
      console.log('server listening on localhost on port 4000');
  });

};
//Database server
//
//Before your interview, write a program that runs a server 
//that is accessible on http://localhost:4000/. When your server 
//receives a request on 
//
//  http://localhost:4000/set?somekey=somevalue 
//
//it should store the passed key and value in memory. When it 
//receives a request on 
//
//  http://localhost:4000/get?key=somekey 
//
//it should return the value stored at somekey.
//
//During your interview, you will pair on saving the data to a file.