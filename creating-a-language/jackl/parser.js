
var formCache = {};
function Form(name) {
  var form = formCache[name];
  if (form) return form;
  this.name = name;
  formCache[name] = this;
}
Form.prototype.toString = function () {
  return "@" + this.name;
};

var variableCache = {};
function Variable(name) {
  var variable = variableCache[name];
  if (variable) return variable;
  this.name = name;
  variableCache[name] = this;
}
Variable.prototype.toString = function () {
  return this.name;
};


function parse(tokens) {
  var state = "start";
  var i = 0;
  var current = [];
  var comments = [];
  var stack = [current];

  tokens.forEach(function (token) {
    if (token === "(") {
      stack.push(current = []);
    }
    else if (token === ")") {
      (current = stack[stack.length - 2]).push(stack.pop());
    }
    else {
      if (Array.isArray(token)) {
        var type = token[0];
        if (type === "FORM") token = new Form(token[1], flushComments());
        else if (type === "IDENT") token = new Variable(token[1], flushComments());
        else if (type === "COMMENT") {
          comments.push(token[1]);
          return;
        }
      }
      current.push(token);
    }
  });

  function flushComments() {
    var string = comments.join("\n");
    comments.length = 0;
    return string;
  }

  console.log("depth", stack.length);
  return current;

}

var tokens = [
  ["COMMENT"," This is an anonymous function that accepts two parameters and adds them."],
  ["COMMENT"," A new variable \"add\" is created and initialized with the fn as it's value"],
  "(",
  ["FORM","let"],
  ["IDENT","add"],
  "(",
  ["FORM","fn"],
  ["IDENT","a"],
  ["IDENT","b"],
  "(",
  "(",
  ["FORM","add"],
  ["IDENT","a"],
  ["IDENT","b"],
  ")",
  ")",
  ")",
  ")",
  ["COMMENT"," Technically we could have just aliased @add directly"],
  "(",
  ["FORM","let"],
  ["IDENT","add"],
  ["FORM","add"],
  ")",
  ["COMMENT"," You can call anything by having it appear first"],
  ["COMMENT"," This calls add with the inputs 1 and 2"],
  "(",
  ["IDENT","add"],
  ["INTEGER",1],
  ["INTEGER",2],
  ")"
];

var tree = parse(tokens);
console.log(JSON.stringify(tree, null, 1));