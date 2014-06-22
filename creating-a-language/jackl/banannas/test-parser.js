var stringify = require('./stringify');

var parse = require('./parser');
var fs = require('../fs')(__dirname);
fs.readFile("./syntax.tokens", function (err, json) {
  if (err) throw err;
  var tokens = JSON.parse(json);
  var tree = parse(tokens);
  console.log(tree.map(stringify).join("\n"));
});
