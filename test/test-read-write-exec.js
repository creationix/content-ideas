var readFile = require('../read').file;
var fs = require('../modules/tedit-fs/fs')(__dirname);
var run = require('../modules/gen-run/run');
var write = require('../write');
var exec = require('../exec');

run(function* () {
  console.log("Loading sample.jkl");
  var list = yield* readFile(fs, "../samples/sample.jkl");
  console.log(write(list));
  var context = mixin({},
    require('../lib/builtins'));
  var result = yield* exec.apply(context, list);
  console.log(write(result));
});

function mixin(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var name in source) {
      if (name in target) {
        throw new Error("Name conflict: " + name + " already in target.");
      }
      target[name] = source[name];
    }
  }
  return target;
}