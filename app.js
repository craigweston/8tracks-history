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
  etracks.authenticate(config.get('username'), config.get('password'), 
    function(auth_token) {
      etracks.tracklist(config.get('api_key'), auth_token, function(data) {
        res.render('index', { title: '8tracks - Recent', mixes: data.mixes });
      });
  })
});

app.listen(3000);
