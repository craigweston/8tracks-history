var http = require('http');
var querystring = require('querystring');
var cookie = require('cookie');

function authenticate(login, password, callback) {
  console.log('etracks - requesting auth token');

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
    if (200 == res.statusCode) {
      var buffer = '';
      res.on('data', function(chunk) {
        buffer += chunk;
      });

      res.on('end', function() {
        var data = null;
        try {
           data = JSON.parse(buffer);
        } catch (err) {
          callback(new Error('error parsing auth JSON response: ' + err));
          return;
        }

        var auth_token = data.auth_token;
        if(auth_token) {
          callback(null, auth_token);
        } else {
          callback(new Error('no user results returned in auth response')); 
        }

      });

    } else {
        callback(new Error('unhandled http status code: ' + res.statusCode));
    }
  });

  req.on('error', function(err) {
    callback(new Error('8tracks auth - error: ' + err));
  });

  req.write(params);
  req.write('data\n');
  req.write('data\n');

  req.end();
}

function history(api_key, auth_token, callback) {
  console.log('etracks - requesting mix history');

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
    if (200 == res.statusCode) {
      var buffer = '';
      res.on('data', function(chunk) {
        buffer += chunk;
      });

      res.on('end', function() {
        var data = null;
        try {
          data = JSON.parse(buffer);  
        } catch(err) {
          callback(new Error('error parsing JSON response'));
          return;
        }

        if(data.mixes) {
          callback(null, data.mixes)
        } else {
          callback(new Error('no mixes returned in response'));
        }

      });
    } else {
      callback(new Error('unhandled http status code: ' + res.statusCode));
    }
  });

  req.on('error', function(err) {
    callback(new Error('8tracks history - error: ' + err));
  });

  req.end();
}

function ETracks() {
  if(!(this instanceof arguments.callee)) {
    return new ETracks();
  }

  this.auth_tokens = {}; 
}

ETracks.prototype.history = function(api_key, login, password, callback) {
  var auth_token = this.auth_tokens[login];
  if(!auth_token) {
    var self = this;
    authenticate(login, password, function(err, auth_token) { 
      if(err) {
        callback(err);
      } else {
        self.auth_tokens[login] = auth_token;
        history(api_key, auth_token, callback); 
      }
    }); 
  } else {
    history(api_key, auth_token, callback);
  }
};

module.exports = new ETracks();
