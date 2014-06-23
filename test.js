var readFile = require('./read').file;
var fs = require('./modules/tedit-fs/fs')(__dirname);
var run = require('./modules/gen-run/run');
var write = require('./write');

run(function* () {
  console.log("Loading sample.jkl");
  var list = yield* readFile(fs, "./sample.jkl");
  console.log(write(list));
});
