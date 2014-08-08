"use strict";

module.exports = {
  "+": addForm,
  "-": subForm,
  "*": mulForm,
  "/": divForm,
  "%": modForm,
  "<": ltForm,
  "<=": lteForm,
  ">": gtForm,
  ">=": gteForm,
  "=": eqForm,
  "!=": neqForm,
};

function mathToString() {
  /*jshint validthis: true*/
  return "<<math " + this.name + ">>";
}

// Common logic for transitive binary operations like "+", "*"
function sumOp(args, name, sum, fn) {
  for (var i = 0; i < args.length; i++) {
    var item = args[i];
    if (item !== item|0) {
      throw new Error(name + " only accepts integers");
    }
    sum = fn(sum, item);
  }
  return sum;
}

// Common logic for binary operations like "-", "/" and "%" and "!="
function binOp(args, name, fn) {
  if (args.length !== 2) {
    throw new Error(name + " requires exactly two arguments");
  }
  var first = args[0]|0;
  var second = args[1]|0;
  if (first !== args[0] || second !== args[1]) {
    throw new Error(name + " only accepts integers");
  }
  return fn(first, second);
}

// Chainable comparers like "=", "<", and ">".
function chainOp(args, name, fn) {
  if (args.length < 2) {
    throw new Error(name + " requires at least 2 arguments");
  }
  var num;
  for (var i = 1; i < arguments.length; i++) {
    var item = arguments[i]|0;
    if (item !== arguments[i]) {
      throw new Error(name + " only accepts integers");
    }
    if (num !== undefined) {
      if (!fn(num, item)) return false;
    }
    num = item;
  }
  return true;
}

addForm.toString = mathToString;
function* addForm() {
  /*jshint noyield:true*/
  return sumOp(arguments, "add", 0, function (sum, num) {
    return sum + num;
  });
}

subForm.toString = mathToString;
function* subForm() {
  /*jshint noyield:true*/
  return binOp(arguments, "sub", function (first, second) {
    return first - second;
  });
}

mulForm.toString = mathToString;
function* mulForm() {
  /*jshint noyield:true*/
  return sumOp(arguments, "mul", 1, function (sum, num) {
    return sum * num;
  });
}

divForm.toString = mathToString;
function* divForm() {
  /*jshint noyield:true*/
  return binOp(arguments, "div", function (first, second) {
    return (first / second)|0;
  });
}

modForm.toString = mathToString;
function* modForm() {
  /*jshint noyield:true*/
  return binOp(arguments, "mod", function (first, second) {
    return first % second;
  });
}

ltForm.toString = mathToString;
function* ltForm() {
  /*jshint noyield:true*/
  return chainOp(arguments, "lt", function (prev, curr) {
    return prev < curr;
  });
}

lteForm.toString = mathToString;
function* lteForm() {
  /*jshint noyield:true*/
  return chainOp(arguments, "lte", function (prev, curr) {
    return prev <= curr;
  });
}

gtForm.toString = mathToString;
function* gtForm() {
  /*jshint noyield:true*/
  return chainOp(arguments, "gt", function (prev, curr) {
    return prev > curr;
  });
}

gteForm.toString = mathToString;
function* gteForm() {
  /*jshint noyield:true*/
  return chainOp(arguments, "gte", function (prev, curr) {
    return prev >= curr;
  });
}

eqForm.toString = mathToString;
function* eqForm() {
  /*jshint noyield:true*/
  return chainOp(arguments, "eq", function (prev, curr) {
    return prev === curr;
  });
}

neqForm.toString = mathToString;
function* neqForm() {
  /*jshint noyield:true*/
  return binOp(arguments, "neq", function (first, second) {
    return first !== second;
  });
}
