"use strict";

var tokenize = require('./tokenize')(require('./tokens'));

var programs = [
  "var add = {a, b|\n  a + b\n}\n",
  "var add={a,b|a+b}",
  "var add = {\n  a,\n  b\n|\n  a +\n  b\n}\n"
];
var out = [
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
];

programs.forEach(function (string) {
  console.log(string);
  console.group();
  var tokens = tokenize(string);
  tokens.forEach(function (token) {
    console.log(token);
  });
  console.groupEnd();
  if (JSON.stringify(tokens) !== JSON.stringify(out)) {
    throw new Error("Wrong output");
  }
});
