module.exports = tokenize;

function tokenize(string) {
  var tokens = [];
  var length = rules.length;

  while (string) {
    var match;
    for (var i = 0; i < length; i += 2) {
      match = string.match(rules[i + 1]);
      if (!match) continue;
      var token = rules[i];
      if (!token) break;
      if (typeof token === "function") {
        token = token(match);
      }
      tokens.push(token);
      break;
    }
    if (match) {
      string = string.substring(match[0].length);
    }
    else {
      tokens.push(["TRASH", string[0]]);
      string = string.substring(1);
    }
  }
  tokens.push("EOF");
  return tokens;
}

var rules = [

  COMMENT,  /^--(.*)/,
  BINARY,   /^<[0-9a-f]{2}(?:(?:\s|\r\n)*[0-9a-f]{2})*>/i,
  CONSTANT, /^(?:null|true|false)\b/,
  TYPE,     /^(?:Integer|Boolean|Null|String|Buffer|Tuple|List|Object|Function|Coroutine|Form)\b/,
  'RETURN', /^return\b/,
  'ABORT',  /^abort\b/,
  'VARS',   /^vars\b/,
  'FOR',    /^for\b/,
  'DELETE', /^delete\b/,
  'IN',     /^in\b/,
  'IS',     /^is\b/,
  'ESCAPE', /^escape\b/,
  'EXEC',   /^exec\b/,
  'SPLIT',  /^split\b/,
  'AND',    /^\s*and\b/,
  'IF',     /^if\b/,
  'ELIF',   /^\s*elif\b/,
  'ELSE',   /^\s*else\b/,
  'WHILE',  /^while\b/,
  TEXT,     /^"(?:[^"\\]|\\.)*"/,
  TEXT,     /^'(?:[^'\\]|\\.)*'/,
  FORM,     /^@([a-z]+)/,
  IDENT,    /^[a-z_](?:[-]?[a-z0-9_])*[?!]?/i,
  SYMBOL,   /^(:+)([a-z_](?:[-]?[a-z0-9_])*[?!]?)/i,
  HEX,      /^(-?)0[x]([0-9a-f]+)/i,
  INTEGER,  /^(?:0|[+-]?[1-9][0-9]*)/,

  ':',  /^:/,

  '||', /^\|\|/,
  '^^', /^\^\^/,

  '&&', /^&&/,

  '!=', /^!=/,
  '==', /^==/,

  '<=', /^<=/,
  '<',  /^</,
  '>=', /^>=/,
  '>',  /^>/,

  '+',  /^\+/,
  '-',  /^-/,

  '*',  /^\*/,
  '/',  /^\//,
  '^',  /^\^/,
  '%',  /^\%/,

  '#',  /^\#/,

  ',',  /^,/,
  '.',  /^\s*\./,
  '!',  /^!/,
  '=',  /^=/,
  '[',  /^\[\s*/,
  ']',  /^\s*\]/,
  '{',  /^\{\s*/,
  '|',  /^\|\s*/,
  '}',  /^\s*\}/,
  '(',  /^\(\s*/,
  ')',  /^\s*\)/,

  'TERM', /^\s*(?:\r\n|\r|\n|;)\s*/,
  null,   /^\s+/, // Skip whitespace
];

function COMMENT(match) {
  return ['COMMENT', match[1]];
}

function BINARY(match) {
  return ['BINARY', match[0].match(/[0-9a-f]{2}/ig).map(function (hex) {
    return String.fromCharCode(parseInt(hex, 16));
  }).join("")];
}

function CONSTANT(match) {
  return match[0] === null ? "NULL" :
    ["BOOLEAN", match[0] === "true"];
}

function TYPE(match) {
  return ["TYPE", match[0]];
}

function TEXT(match) {
  // TODO: write a proper parser for Jack strings instead of stealing JS's eval.
  return ["TEXT", eval(match[0])];
}

function FORM(match) {
  return ["FORM", match[1]];
}

function IDENT(match) {
  return ["IDENT", match[0]];
}

function SYMBOL(match) {
  return ["SYMBOL", {
    level: match[1].length,
    ident: match[2]
  }];
}

function HEX(match) {
  return ["HEX", parseInt(match[1] + match[2], 16)];
}

function INTEGER(match) {
  return ["INTEGER", parseInt(match[0], 10)];
}
