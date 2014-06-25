var readFile = require('../read').file;
var fs = require('../modules/tedit-fs/fs')(__dirname);
var run = require('../modules/gen-run/run');
var exec = require('../exec');

run(function* () {
  console.info("Running sample.jkl");
  var before = Date.now();
  var list = yield* readFile(fs, "../samples/maze.jkl");
  var context = Object.create(mixin({},
    require('../lib/builtins'),
    require('../lib/math'),
    require('../lib/iterators')
  ));
  var result = yield* exec.apply(context, list);
  console.info(result);
  console.log(Date.now() - before, "ms elapsed");
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