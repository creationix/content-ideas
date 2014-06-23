"use strict";
module.exports = execBlock;

var error = require('./error');

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

function* execItem(item) {
  /*jshint validthis:true*/
  if (Array.isArray(item)) {
    if (!item.length) {
      throw error(item, "executing", "Can't eval empty lists");
    }
    var fn = yield* execItem.call(this, item[0]);
    if (typeof fn !== "function") {
      throw error(item[0], "executing", "First list expression must be function");
    }

    var args;
    if (fn.raw) args = item.slice(1);
    else {
      for (var i = 1; i < item.length; i++) {
        args[i - 1] = yield* execItem.call(this, args[i]);
      }
    }

    try {
      return yield* fn.apply(this, args);
    }
    catch (err) {
      if (err.message) throw err;
      throw error(item, "executing", err);
    }
  }

  if (item.id) {
    if (!(item.id in this)) {
      throw error(item, "executing", "Undefined variable '" + item.id + "'");
    }
    return this[item.id];
  }

  return item.constant;
}