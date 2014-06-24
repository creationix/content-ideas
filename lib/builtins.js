"use strict";
var exec = require('../exec');
var read = require('../read');
var write = require('../write');
var error = require('../error');
var slice = [].slice;

module.exports = {
  def: defForm,
  λ: λForm,
  print: printForm,
  list: listForm,
  read: read,
  write: write,
  exec: exec,
};

defForm.raw = true;
function* defForm(name, ...value) {
  /*jshint validthis:true*/
  if (name === undefined || value === undefined) {
    throw "Name and value are required arguments to def";
  }
  if (Array.isArray(name)) {
    return yield* defForm.call(this, name[0], [λForm, name.slice(1), ...value]);
  }
  if (!name.id) {
    throw error(name, "def", "First arg to def must be list or variable", TypeError);
  }
  if (this.hasOwnProperty(name.id)) {
    throw error(name, "def", "Can't redefine local variable '" + name.id + "'", TypeError);
  }
  return (this[name.id] = yield* exec.call(this, ...value));
}

λForm.raw = true;
function λForm(args, ...body) {
  /*jshint validthis:true*/
  if (args === undefined) {
    throw "Lambda requires at least one argument";
  }
  if (!Array.isArray(args)) {
    throw error(args, "λ", "Lambda arguments must be a list", SyntaxError);
  }
  var names = [];
  for (var i = 0; i < args.length; i++) {
    var name = args[i];
    if (!name.id) {
      throw error(name, "λ", "Must be variable name", SyntaxError);
    }
    names.push(name.id);
  }

  return makeLambda.call(this, names, body);
}

function makeLambda(names, body) {
  /*jshint validthis:true*/
  var context = Object.create(this);
  λ.body = body;
  λ.names = names;
  return λ;
  function* λ() {
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
