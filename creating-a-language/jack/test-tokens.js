"use strict";

var tokenize = require('./tokenize')(require('./tokens'));

var tests = [
  [[
    "var add = {a, b|\n  a + b\n}\n",
    "var add={a,b|a+b}",
    "var add = {\n  a,\n  b\n|\n  a +\n  b\n}\n"
  ], [
    ["IDENT","var"],
    ["IDENT","add"],
    "=",
    "{",
    ["IDENT","a"],
    ",",
    ["IDENT","b"],
    "|",
    ["IDENT","a"],
    "+",
    ["IDENT","b"],
    "}",
    "TERM",
    "EOF"
  ]],
  [[
    "a @a :a ::a"
  ], [
    ["IDENT","a"],
    ["FORM","a"],
    ["SYMBOL",{"depth":1,"ident":"a"}],
    ["SYMBOL",{"depth":2,"ident":"a"}],
    "TERM",
    "EOF"
  ]],
  [[
    "<4a 61 63 6b>"
  ], [
    ["BINARY","Jack"],
    "TERM",
    "EOF"
  ]]
];

tests.forEach(function (pair) {
  var expected = JSON.stringify(pair[1]);
  pair[0].forEach(function (string) {
    console.log(string);
    console.group();
    var tokens = tokenize(string);
    tokens.forEach(function (token) {
      console.log(token);
    });
    var actual = JSON.stringify(tokens);
    if (actual !== expected) {
      console.error(actual);
      console.info(expected);
    }
    console.groupEnd();
  });
});
