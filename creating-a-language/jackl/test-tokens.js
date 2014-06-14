"use strict";

var tokenize = require('./tokenizer')(require('./tokens'));

var tests = [
  '\n' +
  '-- This is an anonymous function that accepts two parameters and adds them.\n' +
  '-- A new variable "add" is created and initialized with the fn as it\'s value\n' +
  '(@let add (@fn a b (\n' +
  '  (@add a b)\n' +
  ')))\n' +
  '\n' +
  '-- Technically we could have just aliased @add directly\n' +
  '(@let add @add)\n' +
  '\n' +
  '-- You can call anything by having it appear first\n' +
  '-- This calls add with the inputs 1 and 2\n' +
  '(add 1 2)\n',
  [
    ["COMMENT"," This is an anonymous function that accepts two parameters and adds them."],
    ["COMMENT"," A new variable \"add\" is created and initialized with the fn as it's value"],
    "(",
    ["FORM","let"],
    ["IDENT","add"],
    "(",
    ["FORM","fn"],
    ["IDENT","a"],
    ["IDENT","b"],
    "(",
    "(",
    ["FORM","add"],
    ["IDENT","a"],
    ["IDENT","b"],
    ")",
    ")",
    ")",
    ")",
    ["COMMENT"," Technically we could have just aliased @add directly"],
    "(",
    ["FORM","let"],
    ["IDENT","add"],
    ["FORM","add"],
    ")",
    ["COMMENT"," You can call anything by having it appear first"],
    ["COMMENT"," This calls add with the inputs 1 and 2"],
    "(",
    ["IDENT","add"],
    ["INTEGER",1],
    ["INTEGER",2],
    ")"
  ],
  '\n' +
  '-- Functions can have named arguments in addition to positional arguments\n' +
  '-- This function will append an "!" if loudly is truthy\n' +
  '(@def speak message ?loudly\n' +
  '  (@print message (@if loudly "!"))\n' +
  ')\n' +
  '\n' +
  '-- Call with the injected argument\n' +
  '(speak loudly=true "Hello")\n' +
  '-- Call without\n' +
  '(speak "Hi")\n',
  [
    ["COMMENT"," Functions can have named arguments in addition to positional arguments"],
    ["COMMENT"," This function will append an \"!\" if loudly is truthy"],
    "(",
    ["FORM","def"],
    ["IDENT","speak"],
    ["IDENT","message"],
    ["PARAM","loudly"],
    "(",
    ["FORM","print"],
    ["IDENT","message"],
    "(",
    ["FORM","if"],
    ["IDENT","loudly"],
    ["TEXT","!"],
    ")",
    ")",
    ")",
    ["COMMENT"," Call with the injected argument"],
    "(",
    ["IDENT","speak"],
    ["IDENT","loudly"],
    "=",
    ["IDENT","true"],
    ["TEXT","Hello"],
    ")",
    ["COMMENT"," Call without"],
    "(",
    ["IDENT","speak"],
    ["TEXT","Hi"],
    ")"
  ],
];

for (var i = 0; i < tests.length; i += 2) {
  var source = tests[i];
  var expected = JSON.stringify(tests[i + 1]);
  var tokens = tokenize(source);
  var actual = JSON.stringify(tokens);
  console.log(source);
  console.group();
  tokens.forEach(log);
  if (actual !== expected) {
    console.error(actual);
    console.info(expected);
  }
  console.groupEnd();
}

function log(token) {
  console.log(token);
}
