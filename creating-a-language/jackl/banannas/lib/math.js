"use strict";

module.exports = {
  "+": addForm,
  "-": subForm,
  "*": mulForm,
  "/": divForm,
  "%": modForm,
};

function mathToString() {
  /*jshint validthis: true*/
  return "<<math " + this.name + ">>";
}

function* mathOp(args, name, fn, sum) {
  /*jshint validthis: true*/
  if (sum === undefined) {
    if (args.length !== 2) {
      throw new Error(name + " requires exactly two arguments");
    }
    if (!Array.isArray(args)) {
      args = [].slice.call(args);
    }
    sum = args.shift();
  }

  for (var i = 0; i < args.length; i++) {
    var item = args[i];
    if (typeof item !== "number") {
      throw new Error(name + " only accepts integers");
    }
    sum = fn(sum, item);
  }
  return sum;
}

addForm.toString = mathToString;
function* addForm() {
  /*jshint validthis: true*/
  return yield* mathOp.call(this, arguments, "add", function (sum, num) {
    return sum + num;
  }, 0);
}

subForm.toString = mathToString;
function* subForm() {
  /*jshint validthis: true*/
  return yield* mathOp.call(this, arguments, "sub", function (sum, num) {
    return sum - num;
  });
}

mulForm.toString = mathToString;
function* mulForm() {
  /*jshint validthis: true*/
  return yield* mathOp.call(this, arguments, "mul", function (sum, num) {
    return sum * num;
  }, 1);
}

divForm.toString = mathToString;
function* divForm() {
  /*jshint validthis: true*/
  return yield* mathOp.call(this, arguments, "div", function (sum, num) {
    return (sum / num)|0;
  });
}

modForm.toString = mathToString;
function* modForm() {
  /*jshint validthis: true*/
  return yield* mathOp.call(this, arguments, "mod", function (sum, num) {
    return sum % num;
  });
}
