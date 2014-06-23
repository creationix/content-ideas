var readFile = require('../read').file;
var fs = require('../modules/tedit-fs/fs')(__dirname);
var run = require('../modules/gen-run/run');
var write = require('../write');
var exec = require('../exec');

run(function* () {
  console.info("Loading sample.jkl");
  var list = yield* readFile(fs, "../samples/sample.jkl");
  console.info(write(list));
  var context = Object.create(mixin({},
    require('../lib/builtins'),
    require('../lib/math')
  ));
  var result = yield* exec.apply(context, list);
  console.info(write(result));
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