var idCache = {};
function Id(name, depth, splat) {
  depth = depth | 0;
  splat = !!splat;
  var key = name + "\0" + depth + "\0" + splat;
  var id = idCache[key];
  if (id) return id;
  idCache[key] = this;
  this.name = name;
  this.depth = depth;
  this.splat = splat;
}
Id.prototype.toString = function () {
  var str = "";
  for (var i = 0; i < this.depth; i++) {
    str += ":";
  }
  str += this.name;
  if (this.splat) {
    str += "…";
  }
  return str;
};

var listId = new Id("list");

function toCode(value) {
  if (Array.isArray(value)) {
    if (value[0] === listId) {
      return "[" + value.slice(1).map(toCode).join(" ") + "]";
    }
    return "(" + value.map(toCode).join(" ") + ")";
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return String(value);
}

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
        else if (type === "ID") token = new Id(token[1], token[2], token[3]);
      }
      current.push(token);
    }
  });

  return current;
}

var tokenize = require('../tokenizer')(require('./tokens'));
var fs = require('../fs')(__dirname);
fs.readFile("./syntax.jkl", function (err, code) {
  if (err) throw err;
  var tokens = tokenize(code);
  var tree = parse(tokens);
  console.log(toCode(tree));
});
