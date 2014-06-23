"use strict";
module.exports = execBlock;

var error = require('./error');

// inputs is array of items to eval.  Returns last expression value
// "this" scope is the context of local variables.
function* execBlock(block) {
  /*jshint validthis:true noyield:true*/
  var value = null;
  for (var i = 0; i < block.length; i++) {
    var item = block[i];
    if (Array.isArray(item)) {
      console.log(item);
      var fn = yield* execBlock.call(this, item[0]);
      throw error(item, "TODO", "Implement function call");
    }
    else if (item.id) {
      throw error(item, "TODO", "Implement ID lookup");
    }
    else {
      value = item.constant;
    }
    if (value === undefined) {
      throw new Error("Value should never be undefined");
    }
  }
  return value;
}