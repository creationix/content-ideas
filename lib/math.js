"use strict";

var error = require('../error');

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
  for (var i = 0; i < args.length; i++) {
    var item = args[i]|0;
    if (item !== args[i]) {
      throw error(item, __filename, name + " only accepts integers");
    }
    if (num !== undefined) {
      if (!fn(num, item)) return false;
    }
    num = item;
  }
  return true;
}

function addForm() {
  return sumOp(arguments, "add", 0, function (sum, num) {
    return sum + num;
  });
}

function subForm() {
  return binOp(arguments, "sub", function (first, second) {
    return first - second;
  });
}

function mulForm() {
  return sumOp(arguments, "mul", 1, function (sum, num) {
    return sum * num;
  });
}

function divForm() {
  return binOp(arguments, "div", function (first, second) {
    return (first / second)|0;
  });
}

function modForm() {
  return binOp(arguments, "mod", function (first, second) {
    return first % second;
  });
}

function ltForm() {
  return chainOp(arguments, "lt", function (prev, curr) {
    return prev < curr;
  });
}

function lteForm() {
  return chainOp(arguments, "lte", function (prev, curr) {
    return prev <= curr;
  });
}

function gtForm() {
  return chainOp(arguments, "gt", function (prev, curr) {
    return prev > curr;
  });
}

function gteForm() {
  return chainOp(arguments, "gte", function (prev, curr) {
    return prev >= curr;
  });
}

function eqForm() {
  return chainOp(arguments, "eq", function (prev, curr) {
    return prev === curr;
  });
}

function neqForm() {
  return binOp(arguments, "neq", function (first, second) {
    return first !== second;
  });
}
