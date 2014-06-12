"use strict";

module.exports = [
  COMMENT, /^--(.*)/,
  BINARY,  /^<[0-9a-f]{2}(?:\s*[0-9a-f]{2})*>/i,
  TEXT,    /^(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/,
  FORM,    /^@([a-z]+)/,
  IDENT,   /^[a-z](?:[_\-]?[a-z0-9])*[?!]?/i,
  HEX,     /^(-?)0[x]([0-9a-f]+)/i,
  INTEGER, /^(?:0|[+-]?[1-9][0-9]*)/,

  // Closing brackets consume whitespace before them
  TEXT,    /^\s*([\}\)\]])/,
  // The bar consumes whitespace on both sides
  TEXT,    /^\s*(\|)\s*/,
  // Any newlines left are considered statement terminators.
  // Also semicolons count as terminators.
  // This also consumes extra whitespace on both sides
  "TERM",  /^\s*[\r\n;]\s*/,
  // Opening braces and most binary operators consume
  // whitespace after them to allow multi-line expressions.
  TEXT,    /^(\{|\(|\[|,|\+|\-|\*|\/|%)\s*/,
  // Ignore any other whitespace left
  null,    /^\s+/, // Skip whitespace
];

// Make sure the source always ends in at least one newline.
// This ensures a TERM at the end of the code.
module.exports.postfix = "\n";

function COMMENT(match) {
  return ['COMMENT', match[1]];
}

function BINARY(match) {
  return ['BINARY', match[0].match(/[0-9a-f]{2}/ig).map(function (hex) {
    return String.fromCharCode(parseInt(hex, 16));
  }).join("")];
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

function HEX(match) {
  return ["HEX", parseInt(match[1] + match[2], 16)];
}

function INTEGER(match) {
  return ["INTEGER", parseInt(match[0], 10)];
}

function TEXT(match) {
  return match[1];
}
