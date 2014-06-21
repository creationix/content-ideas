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
    var expected = JSON.parse(tests[i + 1]);
    var tokens = tokenize(source);
    console.log(source);
    tokens.forEach(log);
  }

  function log(token, i) {
    if (token === ")" || token === "]") console.groupEnd();
    console.log(expected[i]);
    if (token === "(" || token === "[") console.group();
    if (JSON.stringify(token) !== JSON.stringify(expected[i])) {
      console.error(token);
      throw new Error("Token Mismatch");
    }
  }

});
