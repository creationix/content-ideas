"use strict";

var builtins = {
  print: printForm,

  list: listForm,
  def: defForm,
  λ: lambdaForm,
  macro: macroForm,

};

var macros = {};

function builtinToString() {
  /*jshint validthis: true*/
  return "<<native " + this.name + ">>";
}

function userToString() {
  /*jshint validthis: true*/
  return "<<proc 0x" + this.id.toString(16) + ">>";
}

printForm.toString = builtinToString;
function* printForm() {
  /*jshint validthis: true*/
  var args = yield* listForm.apply(this, arguments);
  console.log.apply(console, args.map(stringify));
  return null;
}

listForm.toString = builtinToString;
function* listForm() {
  /*jshint validthis: true*/
  var args = [];
  for (var i = 0; i < arguments.length; i++) {
    var item = arguments[i];
    if (isVar(item) && item.splat) {
      if (!(item.name in this)) {
        throw new Error("Undefined variable: " + item.name);
      }
      var target = this[item.name];
      if (!Array.isArray(target)) {
        throw new Error("Splat must point to list");
      }
      args.push.apply(args, target);
      continue;
    }
    args.push(yield* execItem.call(this, item));
  }
  return args;
}

defForm.toString = builtinToString;
function* defForm(name, ...args) {
  /*jshint validthis: true*/
  var context = this;
  if (!isVar(name)) {
    throw new Error("first arg to def must be variable name");
  }
  name = name.name;
  args = yield* listForm.apply(context, args);
  if (args.length !== 1) {
    throw new Error("def requires exactly two arguments");
  }
  context[name] = args[0];
  return args[0];
}

lambdaForm.toString = builtinToString;
var count = 0;
function* lambdaForm(names, ...body) {
  /*jshint validthis: true*/
  if (!Array.isArray(names)) {
    throw new Error("lambda args must be in list");
  }
  if (!names.every(isVar)) {
    throw new Error("lambda args must be variable names");
  }
  var splatIndex = -1;
  for (var i = 0; i < names.length; i++) {
    var item = names[i];
    if (item.splat) {
      if (splatIndex < 0) splatIndex = i;
      else {
        throw new Error("Only one splat variable allowed in lambda definition");
      }
    }
    names[i] = item.name;
  }
  var context = Object.create(this);
  var id = λ.id = ++count;
  λ.body = body;
  λ.toString = userToString;
  return λ;
  function* λ() {
    var args = yield* listForm.apply(this, arguments);
    var splatNum;
    if (splatIndex < 0) {
      if (args.length !== names.length) {
        throw new Error("Proc 0x" + id.toString(16) + " expected exactly " + names.length + "arguments");
      }
    }
    else {
      splatNum = args.length - names.length + 1;
      if (splatNum < 0) {
        throw new Error("Proc 0x" + id.toString(16) + " expected at least " + (names.length - 1) + "arguments");
      }
    }
    var j = 0;
    var splat = splatIndex >= 0 ? splat = [] : null;
    for (var i = 0; i < args.length; i++) {
      if (j === splatIndex) {
        if (splatNum--) splat.push(args[i]);
        if (!splatNum) context[names[j++]] = splat;
      }
      else context[names[j++]] = args[i];
    }
    return yield* block.call(context, body);
  }
}

macroForm.toString = builtinToString;
function* macroForm(name, inputs, ...body) {
  /*jshint validthis: true*/
  var context = this;
  throw "TODO: macroForm";
}

var makeId = require('./id');
var isId = makeId.is;

function isVar(item) {
  return isId(item) && item.depth === 0;
}

function* execItem(item) {
  /*jshint validthis: true*/
  if (isId(item)) {
    if (item.depth) {
      return makeId(item.name, item.depth - 1, item.splat);
    }
    if (item.splat) {
      throw new Error("Unexpected free splat");
    }
    if (!(item.name in this)) {
      throw new Error("Undefined variable: " + item.name);
    }
    return this[item.name];
  }
  else if (!Array.isArray(item)) {
    return item;
  }
  var first = yield* execItem.call(this, item[0]);
  if (typeof first !== "function") {
    throw new Error("form must start with function");
  }
  return yield* first.apply(this, item.slice(1));
}

function* block(list) {
  /*jshint validthis: true*/
  var value = null;
  for (var i = 0; i < list.length; i++) {
    value = yield* execItem.call(this, list[i]);
  }
  return value;
}

///////////////////////////////////////////////////////////////////

function mixin(source, target) {
  for (var key in source) {
    target[key] = source[key];
  }
}

var run = require('../gen-run');
var stringify = require('./stringify');
var read = require('./read');
var fs = require('../fs')(__dirname);
run(function* () {
  var code = yield fs.readFile("./test.jkl");
  var tree = read(code);
  console.info(tree.map(stringify).join("\n"));
  var context = Object.create(builtins);
  mixin(require('./lib/math'), context);
  mixin(require('./lib/dialog'), context);
  context = Object.create(context);
  var result = yield* block.call(context, tree);
  console.info(stringify(result));
  console.log(context);
});
