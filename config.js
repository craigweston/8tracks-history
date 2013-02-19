var fs = require('fs')

function readFromFile(filename) {
  console.log('reading configuration...');
  try {
    var json = fs.readFileSync(filename, 'utf8');
    return JSON.parse(json);
  } catch(err) {
    console.log('error parsing configuration json');
  }
}

function Config(filename) {
 
  if(!(this instanceof arguments.callee)) {
    return new Config(filename);
  }

  this.data = readFromFile(filename);

  var self = this;
  fs.watchFile(filename, function(curr, prev) {
    self.data = readFromFile(filename);
  });
}

Config.prototype.get = function(key) {
  if(this.data) {
    return this.data[key];
  }
}

module.exports = new Config('./config.json');
