"use strict";

var error = require('../error');
var exec = require('../exec');

module.exports = {
  "for": forForm,
  "map": mapForm,
  "reduce": reduceForm,
  "for*": forStarForm,
  "map*": mapStarForm,
  "reduce*": reduceStarForm,
};

forForm.raw = true;
function* forForm(inputs, ...body) {
  /*jshint validthis:true*/
  return yield* forGeneric.call(this, yield* parallelCompound.call(this, inputs, body));
}

forStarForm.raw = true;
function* forStarForm(inputs, ...body) {
  /*jshint validthis:true*/
  return yield* forGeneric.call(this, yield* nestedCompound.call(this, inputs, body));
}

mapForm.raw = true;
function* mapForm(inputs, ...body) {
  /*jshint validthis:true*/
  return yield* mapGeneric.call(this, yield* parallelCompound.call(this, inputs, body));
}

mapStarForm.raw = true;
function* mapStarForm(inputs, ...body) {
  /*jshint validthis:true*/
  return yield* mapGeneric.call(this, yield* nestedCompound.call(this, inputs, body));
}

filterForm.raw = true;
function* filterForm(inputs, ...body) {
  /*jshint validthis:true*/
  return yield* filterGeneric.call(this, yield* parallelCompound.call(this, inputs, body));
}

filterStarForm.raw = true;
function* filterStarForm(inputs, ...body) {
  /*jshint validthis:true*/
  return yield* filterGeneric.call(this, yield* nestedCompound.call(this, inputs, body));
}

reduceForm.raw = true;
function* reduceForm(inputs, ...body) {
  /*jshint validthis:true*/
  return yield* reduceGeneric.call(this, yield* parallelCompound.call(this, inputs, body));
}

reduceStarForm.raw = true;
function* reduceStarForm(inputs, ...body) {
  /*jshint validthis:true*/
  return yield* reduceGeneric.call(this, yield* nestedCompound.call(this, inputs, body));
}

function* forGeneric(iterator) {
  /*jshint validthis:true*/
  var result = null, out;
  while (out = yield* iterator.call(this), out !== undefined) {
    result = out;
  }
  return result;
}

function* mapGeneric(iterator) {
  /*jshint validthis:true*/
  var result = [], out;
  while (out = yield* iterator.call(this), out !== undefined) {
    if (out !== null) result.push(out);
  }
  return result;
}

function* filterGeneric(iterator) {
  /*jshint validthis:true*/
  var result = [], out;
  while (out = yield* iterator.call(this), out !== undefined) {
    result.push(out);
  }
  return result;
}

function checkInputs(inputs) {
  if (inputs === undefined) throw "inputs must be set";
  if (!Array.isArray(inputs) || inputs.length < 2 || inputs.length % 2) {
    throw error(inputs, __filename, "inputs must be even length list", SyntaxError);
  }
}

// Given a set of id/iterator raw input pairs and a raw body block
// return an iterator that expects to be called in the parent context
// It will create a new nested context on every call and return
// the result of the block.  If the iteration is ended, it uses the special
// `undefined` value to signal since `null` is a valid block return value.
// This runs all pairs of inputs in parallel, stopping at the shortest one.
function* parallelCompound(inputs, body) {
  /*jshint validthis:true*/
  checkInputs(inputs);
  var pairs = [];
  for (var i = 0; i < inputs.length; i += 2) {
    var name = getVar(inputs[i]);
    var value = getIterable(yield* exec.call(this, inputs[i + 1]));
    pairs.push(name, value);
  }
  return function* () {
    /*jshint validthis:true*/
    var context = Object.create(this);
    for (var i = 0; i < pairs.length; i += 2) {
      var fn = pairs[i + 1];
      var value = fn.constructor === Function ? fn.call(this) : yield* fn.call(this);
      if (value === undefined) throw new Error("never return undefined");
      if (value === null) return undefined; // except here, here is fine to undefined
      context[pairs[i]] = value;
    }
    return yield* exec.apply(context, body);
  };
}

// Given a set of id/iterator raw input pairs and a raw body block
// return an iterator that expects to be called in the parent context
// It will create a new nested context on every call and return
// the result of the block.  If the iteration is ended, it uses the special
// `undefined` value to signal since `null` is a valid block return value.
// This runs the pairs of inputs nested so that the input to the right runs once
// for each iteration of the input to it's left.
function* nestedCompound(inputs, body) {
  /*jshint validthis:true*/
  checkInputs(inputs);
  var pairs = [];
  for (var i = 0; i < inputs.length; i += 2) {
    var name = getVar(inputs[i]);
    var value = yield* exec.call(this, inputs[i + 1]);
    pairs.push(name, value);
  }

  var gen = function () {
    return function * () {
      return yield* exec.apply(this, body);
    };
  };

  for (i = pairs.length - 2; i >= 0; i -= 2) {
    gen = nest(pairs[i], pairs[i + 1], gen);
  }
  var fn = gen();

  return function* () {
    return yield* fn.call(Object.create(this));
  };
}

function nest(name, value, fn) {

  return function () {
    var iterator = getIterable(value);
    return function* () {
      var out = yield* iterator.call(this);
      if (out === null) return undefined;
      this[name] = out;
      return yield* fn.call(this);
    };
  };
}


function getVar(item) {
  if (!item || typeof item !== "object" || !item.id) {
    throw error(item, __filename, "expected variable", SyntaxError);
  }
  return item.id;
}

function getIterable(item) {
  console.log("i", item);
  if (item|0 === item) return integerIterator(item);
  if (Array.isArray(item)) return arrayIterator(item);
  if (typeof item === "function") return item;
  throw error(item, __filename, "expected iterable (integer, list, or lambda)", TypeError);
}

function integerIterator(num) {
  var i = 0;
  return function range() {
    return i < num ? i++ : null;
  };
}

function arrayIterator(array) {
  var i = 0;
  return function loop() {
    return i < array.length ? array[i++] : null;
  };
}
