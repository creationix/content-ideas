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
    if (!match) return state;
    if (match.index) {
      console.warn("Non-anchored pattern. Start with ^", pattern);
      return state;
    }

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
    if (nameAfter) {
      next.capture[nameAfter] = text;
    }

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

// var code = 'vars code, fn, op\n\n-- Creating a function constructor manually\ncode = [ @fn, [ @params, \'a\', \'b\' ],[ @add, :a, :b ] ]\nprint("original code", code)\n-- Creating a function constructor using parse\ncode = parse("{a,b|a+b}")[0]\nprint("from string", code)\n-- Creating a function constructor using escape\ncode = escape {a,b|a+b}\nprint("from live function", code)\n-- Mess with code\ncode[2][0] = @mul\nprint(code)\n-- Turn code into live function\nfn = exec code\nprint(fn, fn(2, 3))\n\n-- Run some code dynamic directly\nop = if rand(2) { @add } else { @sub }\ncode = [op, 1, 2]\nprint("code", code)\nprint("result", exec code)\n';
var code = '{a,b|a+b}'
/*
JACK AST
[ @fn,
  [ @params, 'a', 'b' ],
  [ @add, :a, :b ]
]
JS AST
["fn",
  ["params", "a", "b"],
  ["add",
    ["symbol", "a"],
    ["symbol", "b"]
  ]
]
*/

var IDENT = Literal(/^[a-z_](?:[-]?[a-z0-9_])*[?!]?/i);
var INTEGER = Literal(/^(?:0|[+-]?[1-9][0-9]*)/);
var FORM = Literal(/^@[a-z]+/);
var SYMBOL = All(Literal(/^:/), IDENT);

var PARAMS = Plus(IDENT);

var FN = All(
  Literal(/^\{/),
  PARAMS,
  Literal(/^|/),
  Plus(EXPRESSION),
  Literal(/^}/)
);

var VALUE = Any(
  INTEGER,
  IDENT,
  FORM,
  SYMBOL,
  FN
);

var BINOP = Any(
  Literal(/^\+/),
  Literal(/^\-/),
  Literal(/^\*/),
  Literal(/^\//)
);

function EXPRESSION(state) {
  return Any(
    All(VALUE, BINOP, EXPRESSION),
    VALUE
  )(state);
}

function parse(ROOT, text) {
  var state = {
    text: text,
    pos: 0,
    capture: {}
  };
  var next = ROOT(state);
  if (next === state) throw new Error("Failed to parse");
  return next.capture;
}

console.log(parse(EXPRESSION, "1+2+3-4"));
