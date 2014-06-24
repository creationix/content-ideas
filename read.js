"use strict";
// This module exports a function that consumes a string of code and returns
// a parsed list.

var write = require('./write');


exports = module.exports = readString;
exports.file = function* readFile(fs, path) {
  var code = yield* fs.readFile(path);
  return readString(code, path);
};

var error = require('./error');

function readString(string, path) {
  var tokens = tokenize(string, path);
  return parse(tokens);
}


var rules = [
  null,     /^--(.*)/, // Ignore comments
  TEXT,     /^(?:"(?:[^"\\]|\\.)*")/,
  CONSTANT, /^(?:0|-?[1-9][0-9]*|true|false|null)\b/,
  ID,       /^[^\s()[\]{}",'`:;#|\\]+/,
  null,     /^\s+/, // Skip whitespace
  CHAR,     /^./, // Everything else is sent as-is
];

function TEXT(match) {
  var json = match[0].replace(/\n/g, "\\n").replace(/\r/g, "\\r");
  return ["constant", JSON.parse(json)];
}

function ID(match) {
  var name = match[0];
  if (name === "lambda") name = "λ";
  return ["id", name];
}

function CONSTANT(match) {
  return ["constant", JSON.parse(match[0])];
}

function CHAR(match) {
  return ["char", match[0]];
}

function tokenize(string, filename) {
  var scope = {
    string: string,
    filename: filename
  };
  var tokens = [];
  tokens.offset = 0;
  tokens.scope = scope;
  var length = rules.length;
  var offset = 0;
  if (rules.postfix) string += rules.postfix;
  while (offset < string.length) {
    var match, value;
    for (var i = 0; i < length; i += 2) {
      match = string.substring(offset).match(rules[i + 1]);
      if (!match) continue;
      value = rules[i];
      if (typeof value === "function") {
        value = value(match);
      }
      break;
    }
    if (match) {
      if (value) {
        var token = {
          offset: offset,
          scope: scope
        };
        token[value[0]] = value[1];
        tokens.push(token);
      }
      offset += match[0].length;
    }
  }
  return tokens;
}

function parse(tokens) {
  var current = [];
  var expectStack = [];
  var stack = [current];
  var escape = false;

  tokens.forEach(function (token) {
    if (token.char) {
      if (token.char === ":") {
        escape = true;
        return;
      }
      if (token.char === "(" || token.char === "[") {
        stack.push(current = []);
        current.offset = token.offset;
        current.scope = token.scope;
        if (token.char === "[") {
          current.push({
            id: "list",
            offset: token.offset,
            scope: token.scope
          });
          token.closer = "]";
        }
        else {
          token.closer = ")";
        }
        if (escape) {
          token.escape = true;
          escape = false;
        }
        expectStack.push(token);
      }
      else if (token.char === ")"  || token.char === "]") {
        var expected = expectStack.pop();
        if (!expected) {
          throw error(token, "parsing", "Too many closers!", SyntaxError);
        }
        if (token.char !== expected.closer) {
          throw error(token, "parsing", "Expected '" + expected.closer + "', but found '" + token.char + "'", SyntaxError);
        }
        var item = stack.pop();
        if (expected.escape) {
          item = [{
            id: "escape",
            offset: item.offset,
            scope: item.scope
          }, item];
        }
        (current = stack[stack.length - 1]).push(item);
      }
      else {
        throw error(token, "parsing", "Unexpected character!", SyntaxError);
      }
    }
    else {
      if (escape) {
        token = [{
          id: "escape",
          offset: token.offset,
          scope: token.scope
        }, token];
        escape = false;
      }
      current.push(token);
    }
  });
  var expected = expectStack.pop();
  if (expected) {
    throw error(expected, "parsing", "Unclosed opener!", SyntaxError);
  }

  return current;
}
