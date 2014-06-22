"use strict";
var carallel = require('carallel');

var builtins = {
  def: defForm,
  macro: macroForm,
  print: printForm,
  list: listForm,
  λ: lambdaForm,
  "+": addForm,
  "-": subForm,
  "*": mulForm,
  "/": divForm,
  "%": modForm,
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

defForm.toString = builtinToString;
function defForm(args, callback) {
  /*jshint validthis: true*/
  var context = this;
  if (args.length !== 2) {
    return callback(new Error("def requires exactly two arguments"));
  }
  if (!isVar(args[0])) {
    return callback(new Error("first arg to def must be variable name"));
  }
  var name = args[0].name;
  execItem(context, args[1], function (err, value) {
    if (err) return callback(err);
    context[name] = value;
    return callback(null, value);
  });
}

macroForm.toString = builtinToString;
function macroForm(args, callback) {
  /*jshint validthis: true*/
  var context = this;
  throw "TODO: macroForm";
}

printForm.toString = builtinToString;
function printForm(args, callback) {
  /*jshint validthis: true*/
  carallel(args.map(function (item) {
    return execItem(this, item);
  }, this), function (err, args) {
    if (err) return callback(err);
    console.log.apply(console, args.map(stringify));
    callback(null, null);
  });
}

listForm.toString = builtinToString;
function listForm(args, callback) {
  /*jshint validthis: true*/
  carallel(args.map(function (item) {
    return execItem(this, item);
  }, this), callback);
}

lambdaForm.toString = builtinToString;
var count = 0;
function lambdaForm(args, callback) {
  /*jshint validthis: true*/
  if (!Array.isArray(args[0])) {
    return callback(new Error("lambda args must be in list"));
  }
  if (!args[0].every(isVar)) {
    return callback(new Error("lambda args must be variable names"));
  }
  var splatIndex = -1;
  var names = args[0];
  for (var i = 0; i < names.length; i++) {
    var item = names[i];
    if (item.splat) {
      if (splatIndex < 0) splatIndex = i;
      else {
        return callback(new Error("Only one splat variable allowed in lambda definition"));
      }
    }
    names[i] = item.name;
  }
  var body = args.slice(1);
  var context = Object.create(this);
  var id = λ.id = ++count;
  λ.body = body;
  λ.toString = userToString;
  return callback(null, λ);
  function λ(args, callback) {
    var parentContext = this;
    var splatNum;
    if (splatIndex < 0) {
      if (args.length !== names.length) {
        return callback(new Error("Proc 0x" + id.toString(16) + " expected exactly " + names.length + "arguments"));
      }
    }
    else {
      splatNum = args.length - names.length + 1;
      if (splatNum < 0) {
        return callback(new Error("Proc 0x" + id.toString(16) + " expected at least " + (names.length - 1) + "arguments"));
      }
    }
    carallel(args.map(function (item) {
      return execItem(parentContext, item);
    }), function (err, args) {
      var j = 0;
      var splat = splatIndex >= 0 ? [] : null;
      for (var i = 0; i < args.length; i++) {
        if (j === splatIndex) {
          if (splatNum--) splat.push(args[i]);
          else context[names[j++]] = splat;
        }
        else context[names[j++]] = args[i];
      }
      console.log(context);
      block(context, body, callback);
    });
  }
}

function mathOp(context, args, callback, name, sum, fn) {
  carallel(args.map(function (item) {
    return execItem(context, item);
  }), function (err, args) {
    if (err) return callback(err);
    if (sum === undefined) sum = args.shift();

    for (var i = 0; i < args.length; i++) {
      var item = args[i];
      if (typeof item !== "number") {
        return callback(new Error(name + " only accepts integers"));
      }
      sum = fn(sum, item);
    }
    return callback(null, sum);
  });
}

addForm.toString = builtinToString;
function addForm(args, callback) {
  /*jshint validthis: true*/
  mathOp(this, args, callback, "add", 0, function (sum, num) {
    return sum + num;
  });
}

subForm.toString = builtinToString;
function subForm(args, callback) {
  /*jshint validthis: true*/
  if (args.length !== 2) {
    return callback(new Error("sub requires exactly two arguments"));
  }
  mathOp(this, args, callback, "sub", undefined, function (sum, num) {
    return sum - num;
  });
}

mulForm.toString = builtinToString;
function mulForm(args, callback) {
  /*jshint validthis: true*/
  mathOp(this, args, callback, "mul", 1, function (sum, num) {
    return sum * num;
  });
}

divForm.toString = builtinToString;
function divForm(args, callback) {
  /*jshint validthis: true*/
  if (args.length !== 2) {
    return callback(new Error("div requires exactly two arguments"));
  }
  mathOp(this, args, callback, "div", undefined, function (sum, num) {
    return (sum / num)|0;
  });
}

modForm.toString = builtinToString;
function modForm(args, callback) {
  /*jshint validthis: true*/
  if (args.length !== 2) {
    return callback(new Error("mod requires exactly two arguments"));
  }
  mathOp(this, args, callback, "mod", undefined, function (sum, num) {
    return sum % num;
  });
}

var makeId = require('./id');
var isId = makeId.is;

function isVar(item) {
  return isId(item) && item.depth === 0;
}

function execItem(context, item, callback) {
  if (!callback) return execItem.bind(null, context, item);
  if (isId(item)) {
    if (item.depth) {
      return callback(null, makeId(item.name, item.depth - 1, item.splat));
    }
    if (item.splat) {
      return callback(new Error("Unexpected free splat"));
    }
    if (!(item.name in context)) {
      return callback(new Error("Undefined variable: " + item.name));
    }
    return callback(null, context[item.name]);
  }
  else if (!Array.isArray(item)) {
    return callback(null, item);
  }
  execItem(context, item[0], function (err, first) {
    if (err) return callback(err);
    if (typeof first !== "function") {
      return callback(new Error("form must start with function"));
    }
    first.call(context, item.slice(1), callback);
  });
}

function block(context, list, callback) {
  var i = 0;
  go(null, null);
  function go(err, result) {
    if (err || i >= list.length) {
      return callback(err, result);
    }
    execItem(context, list[i++], go);
  }
}


var stringify = require('./stringify');
var read = require('./read');
var fs = require('../fs')(__dirname);
fs.readFile("./test.jkl", function (err, code) {
  if (err) throw err;
  var tree = read(code);
  console.info(tree.map(stringify).join("\n"));
  block(Object.create(builtins), tree, function (err, result) {
    if (err) throw err;
    console.info(stringify(result));
  });
});
