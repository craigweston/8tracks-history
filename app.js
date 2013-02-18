var config = require('./config'), 
  etracks = require('./8tracks'),
  express = require('express'),
  stylus = require('stylus'),
  nib = require('nib');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.use(express.logger('dev'));

app.use(stylus.middleware({
  src: __dirname + '/public',
  compile: function(str, path) {
    console.log('compiling css');
    return stylus(str)
      .set('filename', path)
      .use(nib());
  }
}));

app.use(express.static(__dirname + '/public'));

app.get('/8tracks', function(req, res) {

  var username = config.get('username');
  var password = config.get('password');

  etracks.authenticate(username, password, function(err, auth_token) {
      if(err) {
        console.log(err);
        res.render('index', { error: 'An error has occurred' });
      } else {
        etracks.history(config.get('api_key'), auth_token, function(err, mixes) {
          if(err) {
            console.log(err);
            res.render('index', { error: 'An error has occurred' });
          } else {
            res.render('index', { mixes: mixes });
          }
        });
      }
  })
});

app.listen(3000);
