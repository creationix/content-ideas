"use strict";

/*
Function = '{' Args? '|' Body '}'

Args = IDENT ( ',' IDENT )*

Block = '{' Body '}'

Body = Statement ( TERM Statement )*

Statement = Expression
          | VAR IDENT ( '=' Expression )?

Binop = '+'
      | '-'
      | '*'
      | '/'
      | '%'

Expression = Expression Binop Expression
           | Expression '(' Args? ')'
           | '(' Expression ')'
           | IDENT ( '.' IDENT | '[' Expression ']' )+
           | DATA
           | TEXT
           | FORM
           | SYMBOL
           | HEX
           | OCTAL
           | BINARY
           | INTEGER
           | Function
*/


var formCache = {};
function Form(name) {
  var cached = formCache[name];
  if (cached) return cached;
  this.name = name;
  formCache[name] = this;
}
Form.prototype.toString = function () {
  return "@" + this.name;
};

function JackError(tokens, i, message) {
  console.error({tokens:tokens.slice,i:i});
  this.message = message;
}
JackError.prototype = Object.create(SyntaxError.prototype, {
  constructor: { value: JackError }
});

// Accepts range {start,end} and returns new range {start,mid,end}
// mid is included if a "|" is found.  end is the '}'
// start must point to a '{'
function scanBlock(tokens, range) {
  if (tokens[range.start] !== "{") {
    throw new JackError(tokens, range.start, "Expected '{'");
  }

  var i = range.start + 1, depth = 1;
  var mid = 0;
  while (i <= range.end) {
    var token = tokens[i];
    if (depth === 1 && token === "|") {
      if (mid) throw new JackError(tokens, mid, "Only one '|' allowed per function");
      mid = i;
    }
    else if (token === "{") depth++;
    else if (token === "}" && !--depth) {
      if (mid) {
        return {
          start: range.start,
          mid: mid,
          end: i
        };
      }
      return {
        start: range.start,
        end: i
      };
    }
    i++;
  }
  throw new JackError(tokens, range.end, "Missing closing '}'");
}

function parseFunction(tokens, range) {
  var idents = [];
  for (var i = range.start + 1; i < range.mid; i++) {
    idents.push(getIdent(tokens, i));
  }
  console.log(idents);
  console.log(tokens.slice(range.mid + 1, range.end));
  var item = [new Form("fn")];
  if (idents.length) {
    item.push([new Form("params")].concat(idents));
  }
  i = range.mid + 1;
  while (i <= range.end) {
    var child = parseExpression(tokens, i);
    i = child.next;
    item.push(child.value);
  }
  return item;
}

function getIdent(tokens, i) {
  var token = tokens[i];
  if (Array.isArray(token) && token[0] === "IDENT") {
    return token[1];
  }
  throw new JackError(tokens, i, "Expected Identifier");
}

function parseExpression(tokens, i) {
  console.log("parseExpression", i);
  var item, token = tokens[i];

  // Variable declaration
  if (token === "VAR") {
    item = [new Form("var"), getIdent(tokens, i + 1)];
    i = i + 2;

    // Optional assignment in variable declaration
    if (tokens[i] === "=") {
      var child = parseExpression(tokens, i + 1);
      item.push(child.value);
      i = child.next;
    }
  }

  // Function Literal or Object Literal
  else if (token === "{") {

    // Scan to find the type and range
    var range = scanBlock(tokens, { start: i, end: tokens.length - 1 });

    // It looks like a function literal
    if (range.mid) {
      item = parseFunction(tokens, range);
      i = range.end + 1;
    }

    // It looks like an object literal
    else {
      item = parseObject(tokens, range);
      i = range.end + 1;
    }
  }

  else if (Array.isArray(token)) {
    var type = token[0];
    if (type === "IDENT") {
      item = [new Form("symbol"), token[1]];
      i++;
    }
    else {
      console.error("TODO: handle " + type, token);
      throw "Stop";
    }
  }
  else {
    console.error("TODO: handle me", token);
    throw "Stop"
  }

  if (tokens[i] === "+") {
    var child = parseExpression(tokens, i + 1);
    item = [new Form("add"), item, child.value];
    i = child.next;
  }

  return {
    value: item,
    next: i
  };
}
function parse(tokens) {
  var child = parseExpression(tokens, 0);
  return child.value;
}

var tree = parse([
  "VAR",           // 0
  ["IDENT","add"],
  "=",
  "{",             // 3
  ["IDENT","a"],
  ["IDENT","b"],
  "|",
  // "{",'|','}',
  ["IDENT","a"],   // 7
  "+",
  ["IDENT","b"],   // 9
  "}",             // 10
  "TERM"
]);
Array.prototype.toString = function () {
  return "[" + this.map(function (item) {
    return String(item);
  }).join(", ") + "]";
};
console.log(String(tree));
