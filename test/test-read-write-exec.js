var readFile = require('../read').file;
var fs = require('../modules/tedit-fs/fs')(__dirname);
var run = require('../modules/gen-run/run');
var write = require('../write');
var exec = require('../exec');

run(function* () {
  console.log("Loading sample.jkl");
  var list = yield* readFile(fs, "../samples/sample.jkl");
  console.log(write(list));
  var context = {};
  var result = yield* exec.call(context, list);
  console.log(write(result));
});
