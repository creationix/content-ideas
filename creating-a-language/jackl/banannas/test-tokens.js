"use strict";

var tokenize = require('../tokenizer')(require('./tokens'));
var sample = require('./syntax.jkl#txt');
var expected = require('./syntax.tokens.json');

var tests = [
  '-- Create a function and assign to a local variable.\n' +
  '(def add (λ (a b)\n' +
  '  (print "Adding!")\n' +
  '  (+ a b)\n' +
  '))\n' +
  '\n' +
  '-- Call the new function and print the result.\n' +
  '(print (add 1 2))\n' +
  '\n' +
  '-- Create a macro "defn" that combines "def" and "λ"\n' +
  '(macro defn (name rest...)\n' +
  '  [:def name [:λ rest...]]\n' +
  ')\n' +
  '\n' +
  '-- Use our new macro for shorthand\n' +
  '(defn add (a b)\n' +
  '  (+ a b)\n' +
  ')\n' +
  '\n' +
  '-- Also test some constants\n' +
  '[true false null]\n',

  [
    ["COMMENT"," Create a function and assign to a local variable."],
    "(",
      ["ID","def"],
      ["ID","add"],
      "(",
        ["ID","λ"],
        "(",
          ["ID","a"],
          ["ID","b"],
        ")",
        "(",
          ["ID","print"],
          ["TEXT","Adding!"],
        ")",
        "(",
          ["ID","+"],
          ["ID","a"],
          ["ID","b"],
        ")",
      ")",
    ")",
    ["COMMENT"," Call the new function and print the result."],
    "(",
      ["ID","print"],
      "(",
        ["ID","add"],
        1,
        2,
      ")",
    ")",
    ["COMMENT"," Create a macro \"defn\" that combines \"def\" and \"λ\""],
    "(",
      ["ID","macro"],
      ["ID","defn"],
      "(",
        ["ID","name"],
        ["SPLAT","rest"],
      ")",
      "[",
        ["SYMBOL",1,"def"],
        ["ID","name"],
        "[",
          ["SYMBOL",1,"λ"],
          ["SPLAT","rest"],
        "]",
      "]",
    ")",
    ["COMMENT"," Use our new macro for shorthand"],
    "(",
      ["ID","defn"],
      ["ID","add"],
      "(",
        ["ID","a"],
        ["ID","b"],
      ")",
      "(",
        ["ID","+"],
        ["ID","a"],
        ["ID","b"],
      ")",
    ")",
    ["COMMENT"," Also test some constants"],
    "[",
      true,
      false,
      null,
    "]"
  ]
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
