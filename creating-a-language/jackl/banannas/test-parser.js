var stringify = require('./stringify');

var parse = require('./parser');
var fs = require('../fs')(__dirname);
var run = require('../gen-run');
run(function* () {
  var json = yield fs.readFile("./syntax.tokens");
  var tokens = JSON.parse(json);
  var tree = parse(tokens);
  console.log(tree.map(stringify).join("\n"));
});
