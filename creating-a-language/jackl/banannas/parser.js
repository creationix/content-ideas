
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
        current.push(["ID", "list"]);
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
        if (type === "COMMENT") { return; }
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
  console.log("TREE", tree);
});
