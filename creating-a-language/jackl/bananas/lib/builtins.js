"use strict";
var stringify = require('../stringify');
var makeId = require('../id');
var isId = makeId.isId;
var isVar = makeId.isVar;

module.exports = {
  print: printForm,

  list: listForm,
  def: defForm,
  λ: lambdaForm,
  macro: macroForm,
};

function builtinToString() {
  /*jshint validthis: true*/
  return "<<native " + this.name + ">>";
}

function userToString() {
  /*jshint validthis: true*/
  return "<<proc 0x" + this.id.toString(16) + ">>";
}

var arrayMap = [].map;
var arraySlice = [].slice;

printForm.toString = builtinToString;
function* printForm() {
  /*jshint noyield:true*/
  console.log.apply(console, arrayMap.call(arguments, stringify));
  return null;
}

listForm.toString = builtinToString;
listForm.raw = true;
function* listForm() {
  /*jshint validthis: true*/
  var args = [];
  var input = arraySlice.call(arguments);
  for (var i = 0; i < input.length; i++) {
    var item = input[i];
    if (Array.isArray(item) && item[0] in macros) {
      var macro = macros[item[0]];
      var newPieces = yield* macro.apply(this, item.slice(1));
      input.splice(i, 1, newPieces);
      i--;
      continue;
    }
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
defForm.raw = true;
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

var count = 0;
lambdaForm.toString = builtinToString;
lambdaForm.raw = true;
function* lambdaForm(names, ...body) {
  /*jshint validthis:true noyield:true*/
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
  return createLambda(context, names, splatIndex, body);
}

function createLambda(context, names, splatIndex, body, raw) {
  var id = λ.id = ++count;
  λ.body = body;
  λ.toString = userToString;
  return λ;
  function* λ() {
    /*jshint validthis: true*/
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
    var results = yield* listForm.apply(context, body);
    if (raw) return results;
    if (!results.length) return null;
    return results[results.length - 1];
  }
}

var macros = {};
macroForm.toString = builtinToString;
macroForm.raw = true;
function* macroForm(name, inputs, ...body) {
  /*jshint noyield:true*/
  if (name in macros) {
    throw new Error("Macro already exists with name: " + name);
  }
  if (!Array.isArray(inputs)) {
    throw new Error("Macro inputs must be a list");
  }
  if (!inputs.every(isVar)) {
    throw new Error("Macro inputs must be variable names");
  }
  var splatIndex = -1;
  for (var i = 0; i < inputs.length; i++) {
    var item = inputs[i];
    if (item.splat) {
      if (splatIndex < 0) splatIndex = i;
      else {
        throw new Error("Only one splat variable allowed in lambda definition");
      }
    }
    inputs[i] = item.name;
  }

  var context = {
    list: listForm
  };
  macros[name] = createLambda(context, inputs, splatIndex, body, true);
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
  var args = item.slice(1);
  if (!first.raw) {
    args = yield* listForm.apply(this, args);
  }
  var result = yield* first.apply(this, args);
  if (result === undefined) {
    throw new Error("Functions must not return undefined");
  }
  return result;
}
