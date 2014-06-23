"use strict";
// This module exports a function that consumes a string of code and returns
// a parsed list.

exports = module.exports = readString;
exports.file = function* readFile(fs, path) {
  var code = yield* fs.readFile(path);
  return readString(code, path);
};

function readString(string, path) {
  var tokens = tokenize(string, path);
  return parse(tokens);
}

var rules = [
  null,     /^--(.*)/, // Ignore comments
  TEXT,     /^(?:"(?:[^"\\]|\\.)*")/,
  CONSTANT, /^(?:0|-?[1-9][0-9]*|true|false|null)\b/,
  ID,       /^[^\s()[\]{}",'`:;#|\\.…]+/,
  null,     /^\s+/, // Skip whitespace
  CHAR,     /^./, // Everything else is sent as-is
];

function TEXT(match) {
  var json = match[0].replace(/\n/g, "\\n").replace(/\r/g, "\\r");
  return ["text", JSON.parse(json)];
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
  var tokens = [];
  var length = rules.length;
  var scope = {
    string: string,
    filename: filename
  };
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

function error(token, title, inline, CustomError) {
  title = title || "";
  inline = inline || "";
  CustomError = CustomError || Error;
  var string = token.scope.string;
  var filename = token.scope.filename;
  var offset = token.offset;
  var before = string.substring(0, offset).split("\n");
  var after = string.substring(offset).split("\n");
  var line = before.pop() || "";
  var column = line.length;
  line += after.shift() || "";
  var row = before.length;
  var above = before.pop() || "";
  var below = after.shift() || "";
  var indent = "";
  for (var i = 0; i < column; i++) {
    indent += "-";
  }
  return new CustomError(title + " at (" + filename + ":" + (row + 1) + ":" + (column + 1) + ")\n" +
    above + "\n" +
    line + "\n" +
    indent + "^ " + inline + "\n" +
    below
  );
}


  // throw error(tokens[30], "reading", "Unexpected parenthesis!", SyntaxError);

function parse(tokens) {
  var current = [];
  var expectStack = [];
  var stack = [current];

  tokens.forEach(function (token) {
    if (token.char) {
      if (token.char === "(") {
        stack.push(current = []);
        token.closer = ")";
        expectStack.push(token);
      }
      else if (token.char === "[") {
        stack.push(current = []);
        current.push({
          id: "list",
          offset: token.offset,
          scope: token.scope
        });
        token.closer = "]";
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
        (current = stack[stack.length - 2]).push(stack.pop());
      }
      else {
        throw error(token, "parsing", "Unexpected character!", SyntaxError);
      }
    }
    else {
      current.push(token);
    }
  });
  var expected = expectStack.pop();
  if (expected) {
    throw error(expected, "parsing", "Unclosed opener!", SyntaxError);
  }

  return current;
}
