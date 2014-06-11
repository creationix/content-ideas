"use strict";

function parse(string) {

}

function jackGrammer(All, Any, Plus, Optional, Char, Capture) {
  return function program($) {

  };
}

// Inline the deps
var tokenize = (function () {

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
        else if (typeof token === "string") {
          token = [token];
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

  return tokenize;

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
}());

function parse(tokens) {
  console.log(tokens);
  return $program(0);

  function $program(offset) {
    var statements = [];
    var statement, o;
    while (tokens[offset] !== "EOF") {
      var result = $statement(offset);
      if (!result) return fail(offset);
      statements.push(result[1]);
      offset += result[0];
    }
    return ["PROGRAM", statements];
  }

  function $statement(offset) {

    var expression = $expression();
    console.log(tokens[i])
  }

      ["STRING", "$$ = eval($1)"],
      ["IDENT", "$$ = yy.S($1)"],
      ["SYMBOL", "$$ = yy.S($1)"],
      ["form", "$$ = $1"],
      ["integer", "$$ = $1"],
      ["CONSTANT", "$$ = $1 === 'true' ? true : $1 === 'false' ? false : undefined"],
      ["BUFFER", "$$ = new Buffer($1.substr(1, $1.length - 2).split(/\\s+/).map(function (b) { return parseInt(b, 16);}))"],

      ["expr IS TYPE", "$$ = [yy.F('is'), $1, $3]"],
      ["expr IN expr", "$$ = [yy.F('in'), $3, $1]"],

      ["expr * expr", "$$ = [yy.F('mul'), $1, $3]"],
      ["expr / expr", "$$ = [yy.F('div'), $1, $3]"],
      ["expr ^ expr", "$$ = [yy.F('pow'), $1, $3]"],
      ["expr % expr", "$$ = [yy.F('mod'), $1, $3]"],

      ["expr + expr", "$$ = [yy.F('add'), $1, $3]"],
      ["expr - expr", "$$ = [yy.F('sub'), $1, $3]"],

      ["expr < expr", "$$ = [yy.F('lt'), $1, $3]"],
      ["expr <= expr", "$$ = [yy.F('le'), $1, $3]"],
      ["expr > expr", "$$ = [yy.F('lt'), $3, $1]"],
      ["expr >= expr", "$$ = [yy.F('le'), $3, $1]"],

      ["expr != expr", "$$ = [yy.F('neq'), $1, $3]"],
      ["expr == expr", "$$ = [yy.F('eq'), $1, $3]"],

      ["expr && expr", "$$ = [yy.F('and'), $1, $3]"],

      ["expr || expr", "$$ = [yy.F('or'), $1, $3]"],
      ["expr ^^ expr", "$$ = [yy.F('xor'), $1, $3]"],

      ["! expr", "$$ = [yy.F('not'), $2]"],
      ["- expr", "$$ = [yy.F('unm'), $2]"],
      ["# expr", "$$ = [yy.F('len'), $2]"],

      ["func", "$$ = [yy.F('fn')].concat($1)"],

      ["IDENT = expr", "$$ = [yy.F('assign'), $1, $3]"],

      ["ESCAPE expr", "$$ = [yy.F('escape'), $2]"],
      ["EXEC expr", "$$ = [yy.F('exec'), $2]"],

      ["( expr )", "$$ = $2"],
      ["( expr2 )", "$$ = [yy.F('tuple')].concat($2)"],
      ["[ list ]", "$$ = [yy.F('list')].concat($2)"],
      ["{ pairs }", "$$ = [yy.F('object')].concat($2)"],

      ["[ expr FOR iterator ]", "$$ = [yy.F('map')].concat($4).concat([$2])"],

      ["expr lookup", "$$ = [yy.F('get'), $1, $2]"],

      ["expr lookup = expr", "$$ = [yy.F('set'), $1, $2, $4]"],

      ["expr ( list )", "$$ = [yy.F('call'), $1].concat($3)"],


  function fail(offset) {
    throw new Error("Problem at " + offset);
  }
}

console.log(parse(tokenize("a = 1 + 2")))