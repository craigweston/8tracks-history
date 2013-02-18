var http = require('http');
var querystring = require('querystring');
var cookie = require('cookie');

function readAuthToken(header) {
  for(var i=0, len = header.length; i < len; ++i) {
    var authToken = cookie.parse(header[i])['auth_token'];
    if(authToken) {
      return authToken;
    }
  }
}

exports.authenticate = function(login, password, onAuth) {

  var params = querystring.stringify({
    login: login,
    password: password
  });

  var options = { 
    method: 'POST',
    host: '8tracks.com',
    port: 80,
    path: '/sessions.jsonp',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': params.length
    }
  }; 

  var req = http.request(options, function(res) {

    console.log('8tracks auth - response code: ' + res.statusCode);
    console.log('8tracks auth - headers: ' + JSON.stringify(res.headers));

    if (200 == res.statusCode) {

      var resdata = '';

      res.on('data', function(chunk) {
        resdata += chunk;
      });

      res.on('end', function() {
        onAuth(readAuthToken(res.headers['set-cookie']));
      });

    }
  });

  req.on('error', function(err) {
    console.log('8tracks auth - error: ' + err);
  });

  req.write(params);
  req.write('data\n');
  req.write('data\n');

  req.end();
}

exports.tracklist = function(api_key, auth_token, onTrackList) {

  console.log('cookie: ' + cookie.serialize('auth_token', auth_token));

  var options = {
    method: 'GET',
    host: '8tracks.com',
    port: 80,
    path: '/mix_sets/listened.jsonp?api_key=' + api_key,
    headers: {
      cookie: cookie.serialize('auth_token', auth_token)
    }
  };

  var req = http.request(options, function(res) {

      console.log('8tracks tracklist - response code: ' + res.statusCode);
      console.log('8tracks tracklist - headers: ' + JSON.stringify(res.headers));

      if (200 == res.statusCode) {

        var resdata = '';

        res.on('data', function(chunk) {
          resdata += chunk;
        });

        res.on('end', function() {

          var pdata;
          try {
            pdata = JSON.parse(resdata);  
          } catch(err) {
            console.log('8tracks tracklist - error parsing JSON response');
            console.log(err);
          }

          onTrackList(pdata);

        });

      }
  });

  req.on('error', function(err) {
    console.log('8tracks tracklist - error: ' + err);
  });

  req.end();
}
