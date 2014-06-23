var exec = require('../exec');
var error = require('../error');

module.exports = {
  def: defForm,
  λ: λForm,
  print: printForm
};

defForm.raw = true;
function* defForm(name, value) {
  if (name === undefined || value === undefined) {
    throw "Name and value are required arguments to def";
  }
  /*jshint validthis:true*/
  if (Array.isArray(name)) {
    throw "TODO: Implement shorthand lamda definition";
  }
  if (!name.id) {
    throw error(name, "def", "First arg to def must be list or variable", TypeError);
  }
  if (this.hasOwnProperty(name.id)) {
    throw error(name, "def", "Can't redefine local variable '" + name.id + "'", TypeError);
  }
  return (this[name.id] = yield* exec.call(this, value));
}

λForm.raw = true;
function* λForm(args, ...body) {
  if (args === undefined) {
    throw "Lambda requires at least one argument";
  }
  /*jshint validthis:true noyield:true*/
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
  /*jshint validthis:true noyield:true*/
  var closure = this;
  λ.body = body;
  λ.names = names;
  return λ;
  function* λ() {
    throw "TODO: Implement custom function"

  }
}

function* printForm(...args) {
  /*jshint noyield:true*/
  console.log.apply(console, args);
  return null;
}