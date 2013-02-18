var fs = require('fs')

function Config() {
 
  if(!(this instanceof arguments.callee)) {
    return new Config();
  }

  console.log('reading configuration');
  try {
    var json = fs.readFileSync('./config.json', 'utf8');
    this.data = JSON.parse(json);
  } catch(err) {
    console.log('error parsing configuration json');
    return;
  }
}

Config.prototype.get = function(key) {
  return this.data[key];
}

module.exports = new Config();
