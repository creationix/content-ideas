"use strict";
module.exports = execBlock;

var error = require('./error');
var write = require('./write');

// inputs is array of items to eval.  Returns last expression value
// "this" scope is the context of local variables.
function* execBlock() {
  /*jshint validthis:true*/
  var value = null;
  for (var i = 0; i < arguments.length; i++) {
    value = yield* execItem.call(this, arguments[i]);
    if (value === undefined) {
      throw new Error("Value should never be undefined");
    }
  }
  return value;
}

function map(obj, fn) {
  var out = {};
  Object.keys(obj).forEach(function (name) {
    out[name] = fn(obj[name]);
  });
  return out;
}

function* execItem(item) {
  /*jshint validthis:true*/
  var result;

  if (Array.isArray(item)) {
    if (!item.length) {
      throw error(item, __filename, "Can't eval empty lists");
    }
    var fn = yield* execItem.call(this, item[0]);
    if (typeof fn !== "function") {
      throw error(item[0], __filename, "First list expression must be function");
    }

    var args;
    if (fn.raw) args = item.slice(1);
    else {
      args = [];
      for (var i = 1; i < item.length; i++) {
        args[i - 1] = yield* execItem.call(this, item[i]);
      }
    }

    try {
      result = yield* fn.apply(this, args);
    }
    catch (err) {
      if (err.message) {
        throw err;
      }
      throw error(item[0], __filename, err);
    }
  }

  else if (!item || typeof item !== "object") {
    result = item;
  }

  else if (item.id) {
    if (!(item.id in this)) {
      throw error(item, __filename, "Undefined variable '" + item.id + "'", TypeError);
    }
    result = this[item.id];
  }

  else if (item.constant !== undefined) {
    result = item.constant;
  }

  return result;
}