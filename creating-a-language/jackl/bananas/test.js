var run = require('../gen-run');
var stringify = require('./stringify');
var read = require('./read');
var fs = require('../fs')(__dirname);
run(function* () {
  var code = yield fs.readFile("./test.jkl");
  var tree = read(code);
  console.info(tree.map(stringify).join("\n"));

  var context = Object.create(require('./lib/builtins'));
  mixin(require('./lib/math'), context);
  mixin(require('./lib/dialog'), context);
  mixin(require('./lib/iterators'), context);

  context = Object.create(context);
  var results = yield* context.list.apply(context, tree);
  var result = results.length ? results[results.length - 1] : null;
  console.info(stringify(result));
  console.log(context);
});

function mixin(source, target) {
  for (var key in source) {
    target[key] = source[key];
  }
}
