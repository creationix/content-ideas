var readFile = require('./read').file;
var fs = require('./modules/fs')(__dirname);
var run = require('./modules/gen-run');


run(function* () {
  console.log("Loading sample.jkl");
  var list = yield* readFile(fs, "./sample.jkl");
  console.log("LIST", list);
});