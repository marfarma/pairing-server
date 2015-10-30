#!/usr/bin/env node

/*jshint -W069 */
'use strict';
(function() {

  var http = require('http');
  var url = require('url') ;
  var isObject = require('util').isObject;
  var fs = require('fs');
  var pair = {};
  var filename = './cache.json';

  module.exports = pair.server = function (callback) {
    var cache = {};
    var server;

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
      return Object.getOwnPropertyNames(obj).length;
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
//      writeCache(false, function(err) {
//        if (err) { serverError(res); }
//      });
      res.writeHead(200);
      res.end('OK');
    }
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


    // Steps:
    // require in fs module
    // persist data as json (simp)
    // Read file, if exists, on server startup
    // Do listen in callback on the read function
    // Trap server close and write file
    // Write file on server shutdown
    // Amend test to start server in before with a callback
    // fell back to calling writeCache on each setValue, 'close' event not firing
    // fixed close event not firing -- fixed write in close callback, took out setValue

//    function serverError(res) {
//      res.writeHead(500);
//      res.end('Server Error');
//    }

    function readCache(cb) {
      fs.readFile(filename, 'utf8', function(err, data) {
        if (err) {
          if (err.code === 'ENOENT') {
            cache = {};
          } else {
            if (cb) {cb(err);}
          }
        } else {
          if ( data.length >= 2) {
            cache = JSON.parse(data);
          }
        }
        if (cb) { cb(null); }
      });
    }

    function writeCache(sync, cb) {
      if (sync) {
        try {
          fs.writeFileSync(filename, JSON.stringify(cache), 'utf8');
        }
        catch (err) {
           // statements to handle any exceptions
          console.log(err);
          if (cb) { cb(err); }
        }
      } else {
        fs.writeFile(filename, JSON.stringify(cache), 'utf8', function writeCallback(err) {
          if (err) {
            console.log(err);
            if (cb) { cb(err); }
          } else {
            if (cb) { cb(null); }
          }
        });
      }
    }

    server = http.createServer(requestListener);

    function close(cb) { //jshint ignore:line
      server.close(cb);
    }

    server.on('close', function() {
      writeCache(true, function(err) {
        if (err) {
          console.log('writeCache Error: ', err);
          throw err;
        }
      });
    });

    // trap ctrl-c
    process.on('SIGINT', function() {
      server.close();
    });

    // initialize cache from json file
    readCache(function(err) {
      if (!err) {
        server.listen(4000, function() {
          //console.log('server listening at http://localhost:4000');

          if (callback) {
            callback(null, server);
          }
        });
      } else {
        if (callback) {
          callback(err);
        }
      }
    });
  };

  if (!module.parent) {
    pair.server();
  }
})();


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
