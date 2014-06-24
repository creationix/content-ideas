"use strict";
var exec = require('../exec');
var read = require('../read');
var write = require('../write');
var error = require('../error');
var slice = [].slice;

module.exports = {
  def: defForm,
  "set": setForm,
  λ: λForm,
  if: ifForm,
  and: andForm,
  or: orForm,
  not: notForm,
  print: printForm,
  list: listForm,
  read: read,
  write: write,
  exec: exec,
  quote: quoteForm,
  sleep: sleepForm,
  macro: macroForm,
};

quoteForm.raw = true;
function quoteForm(item) {
  if (arguments.length !== 1) {
    throw "quote expects exactly 1 argument";
  }
  return item;
}

function* sleepForm(ms) {
  yield function (callback) {
    setTimeout(callback, ms);
  };
  return null;
}

defForm.raw = true;
function* defForm(id, ...value) {
  /*jshint validthis:true*/
  if (id === undefined || value === undefined) {
    throw "id and value are required arguments to def";
  }
  if (Array.isArray(id)) {
    return yield* defForm.call(this, id[0], [λForm, id.slice(1), ...value]);
  }
  var name = getVar(id);
  if (this.hasOwnProperty(name)) {
    throw error(id, "def", "Can't redefine local variable '" + name + "'", TypeError);
  }
  return (this[name] = yield* exec.call(this, ...value));
}

setForm.raw = true;
function* setForm(name, ...value) {
  /*jshint validthis:true*/
  if (name === undefined || value === undefined) {
    throw "Name and value are required arguments to set";
  }
  if (Array.isArray(name)) {
    return yield* setForm.call(this, name[0], [λForm, name.slice(1), ...value]);
  }
  if (!name.id) {
    throw error(name, "set", "First arg to set must be list or variable", TypeError);
  }
  var scope = this;
  while (scope && !scope.hasOwnProperty(name.id)) scope = Object.getPrototypeOf(scope);
  if (!scope) {
    throw error(name, "set", "Can't set undefined variable '" + name.id + "'", TypeError);
  }
  return (scope[name.id] = yield* exec.call(this, ...value));
}

λForm.raw = true;
function λForm(ids, ...body) {
  /*jshint validthis:true*/
  return makeLambda.call(this, getNames(ids), body);
}

macroForm.raw = true;
function* macroForm(ids, ...body) {
  /*jshint validthis:true*/
  var action = makeLambda.call(this, getNames(ids.slice(1)), body);
  macro.raw = true;
  return yield* defForm.call(this, ids[0], macro);
  function* macro() {
    /*jshint validthis:true*/
    var out = yield* action.apply(this, arguments);
    console.log("Generated", out.map(write).join(" "));
    return yield* exec.apply(this, out);
  }
}


function makeLambda(names, body) {
  /*jshint validthis:true*/
  var closure = this;
  λ.body = body;
  λ.names = names;
  return λ;
  function* λ() {
    var context = Object.create(closure);
    if (arguments.length !== names.length) {
      throw "Expected " + names.length + " arguments, but got " + arguments.length;
    }
    for (var i = 0; i < names.length; i++) {
      context[names[i]] = arguments[i];
    }
    return yield* exec.apply(context, body);
  }
}

function printForm(...args) {
  console.log.apply(console, args);
  return null;
}

function listForm() {
  return slice.call(arguments);
}


ifForm.raw = true;
function* ifForm(condition, yes, no) {
  /*jshint validthis:true*/
  if (condition === undefined || yes === undefined) {
    throw "condition and yes path required in if";
  }
  var value = yield* exec.call(this, condition);
  if (value) return yield* exec.call(this, yes);
  return yield* exec.call(this, no || null);
}

andForm.raw = true;
function* andForm(...expressions) {
  /*jshint validthis:true*/
  var result = true;
  for (var i = 0; i < expressions.length; i++) {
    result = yield* exec.call(this, expressions[i]);
    if (!result) return result;
  }
  return result;
}

orForm.raw = true;
function* orForm(...expressions) {
  /*jshint validthis:true*/
  var result = false;
  for (var i = 0; i < expressions.length; i++) {
    result = yield* exec.call(this, expressions[i]);
    if (result) return result;
  }
  return result;
}

function notForm(expression) {
  if (arguments.length !== 1) {
    throw "not expects exactly one argument";
  }
  return !expression;
}

function getNames(ids) {
  if (!Array.isArray(ids)) {
    throw error(ids, __filename, "Expected name list", SyntaxError);
  }
  return ids.map(getVar);
}

function getVar(item) {
  if (!item || typeof item !== "object" || !item.id) {
    throw error(item, __filename, "expected variable", SyntaxError);
  }
  return item.id;
}
