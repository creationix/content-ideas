"use strict";

module.exports = parse;

var makeId = require('./id');

var listId = makeId("list");

function parse(tokens) {
  var current = [];
  var expectStack = [];
  var stack = [current];

  tokens.forEach(function (token) {
    if (typeof token === "string") {
      if (token === "(") {
        stack.push(current = []);
        expectStack.push(")");
      }
      else if (token === "[") {
        stack.push(current = []);
        current.push(listId);
        expectStack.push("]");
      }
      else if (token === ")"  || token === "]") {
        var expected = expectStack.pop();
        if (token !== expected) {
          throw new Error("Missing " + expected);
        }
        (current = stack[stack.length - 2]).push(stack.pop());
      }
      else {
        throw new Error("Unexpected " + token);
      }
    }
    else {
      if (Array.isArray(token)) {
        var type = token[0];
        // Ignore comments for now
        if (type === "COMMENT") return;
        else if (type === "TEXT") token = token[1];
        else if (type === "ID") token = makeId(token[1], token[2], token[3]);
      }
      current.push(token);
    }
  });

  return current;
}
