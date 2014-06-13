"use strict";

var tokenize = require('./tokenizer')(require('./tokens'));

var tests = [
  [[
    "var add = {a b|\n  a + b\n}\n",
    "var add={a b|a+b}",
    "var add = {\n  a b\n|\n  a +\n  b\n}\n"
  ], [
    "VAR",
    ["IDENT","add"],
    "=",
    "{",
    ["IDENT","a"],
    ["IDENT","b"],
    "|",
    ["IDENT","a"],
    "+",
    ["IDENT","b"],
    "}",
    "TERM"
  ]],
  [[
    "a @a :a ::a"
  ], [
    ["IDENT","a"],
    ["FORM","a"],
    ["SYMBOL",{"depth":1,"ident":"a"}],
    ["SYMBOL",{"depth":2,"ident":"a"}],
    "TERM"
  ]],
  [[
    "<4a 61 63 6b>"
  ], [
    ["DATA","Jack"],
    "TERM"
  ]],
  [[
    '"Hello"',
    "'Hello'"
  ], [
    ["TEXT", "Hello"],
    "TERM"
  ]],
  [[
    "cool-name, question?, statement!"
  ], [
    ["IDENT","cool-name"],
    ",",
    ["IDENT","question?"],
    ",",
    ["IDENT","statement!"],
    "TERM"
  ]],
  [[
    "-1 1 0 -0 0xdeadbeef -0xdeadbeef 0o123 0b1010"
  ], [
    "-",
    ["INTEGER",1],
    ["INTEGER",1],
    ["INTEGER",0],
    "-",
    ["INTEGER",0],
    ["HEX",3735928559],
    "-",
    ["HEX",3735928559],
    ["OCTAL",83],
    ["BINARY",10],
    "TERM"
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
