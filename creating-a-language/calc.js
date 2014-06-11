var slice = [].slice;

// Match if all rules match (in order)
function All(/*rules*/) {
  var rules = arguments;
  var length = arguments.length;
  return function (original) {
    var state = original;
    for (var i = 0; i < length; i++) {
      state = rules[i](state);
      if (state === original) return original;
    }
    return state;
  };
}

// Matches the first successful rule (or none)
function Any() {
  var rules = arguments;
  var length = arguments.length;
  return function (original) {
    for (var i = 0; i < length; i++) {
      var state = rules[i](original);
      if (state !== original) return state;
    }
    return original;
  };
}

// Match a rule one or more times
function Plus(rule) {
  return function (state) {
    var next;
    while (next = rule(state), next !== state) state = next;
    return state;
  };
}

function Optional(rule) {
  return function (original) {
    var next = rule(original);
    if (next !== original) return next;
    return cloneState(original);
  };
}

// Match a text literal using regular expression.
// Must start with
function Literal(pattern) {
  return function(state) {
    var match = state.text.substring(state.pos).match(pattern);
    if (match.index) {
      console.warn("Non-anchored pattern. Start with ^");
    }
    if (!match || match.index) return state;

    return {
      text: state.text,
      pos: state.pos + match[0].length,
      capture: state.capture
    };
  };
}

function Capture(rule, nameAfter, nameBefore) {
  return function (original) {
    var next = rule(original);
    if (next === original) return original;

    var text = original.text.substring(original.pos, next.pos);
    if (nameBefore) {
      var old = next.capture;
      next.capture = {};
      next.capture[nameBefore] = old;
    }
    next.capture[nameAfter] = text;

    return next;
  };
}

// This is to clone a state object so that it has the same value, but doesn't
// pass equality test with original.
function cloneState(state) {
  return {
    text: state.text,
    pos: state.pos,
    capture: state.capture
  };
}

////////////////////////////////


var integer = Literal(/^[0-9]+/);
var operator = Literal(/^(\+|-|\/|\*)/);
var whitespace = Optional(Literal(/^[\s\r\n]+/));
var add = All(
  Capture(integer, "first"),
  whitespace,
  Capture(operator, "operator"),
  whitespace,
  Capture(integer, "second")
);

console.log(add({
  text: "1 + 2",
  pos: 0,
  capture: {}
}).capture);
