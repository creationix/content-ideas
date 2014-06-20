"use strict";

var tokenize = require('../tokenizer')(require('./tokens'));
var fs = require('../fs')(__dirname);
var carallel = require('carallel');
carallel([
  fs.readFile("./syntax.jkl"),
  fs.readFile("./syntax.tokens"),
], function (err, tests) {
  if (err) throw err;
  for (var i = 0; i < tests.length; i += 2) {
    var source = tests[i];
    var expected = JSON.stringify(JSON.parse(tests[i + 1]));
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
});

function log(token) {
  console.log(token);
}
