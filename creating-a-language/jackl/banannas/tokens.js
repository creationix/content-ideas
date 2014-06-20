"use strict";

module.exports = [
  COMMENT,  /^--(.*)/,
  INTEGER,  /^(?:0|-?[1-9][0-9]*)/,
  TEXT,     /^(?:"(?:[^"\\]|\\.|\s)*")/,
  CONSTANT, /^(?:true|false|null)\b/,
  SPLAT,    /^([^\s()[\]{}",'`:;#|\\.]+)(?:\.\.\.|…)/,
  SYMBOL,   /^(:+)([^\s()[\]{}",'`:;#|\\.]+)/,
  ID,       /^[^\s()[\]{}",'`:;#|\\.]+/,
  undefined,/^\s+/, // Skip whitespace
];

function COMMENT(match) {
  return ['COMMENT', match[1]];
}

function TEXT(match) {
  return ["TEXT", JSON.parse(match[0])];
}

function ID(match) {
  return ["ID", match[0]];
}

function SYMBOL(match) {
  return ["SYMBOL", match[1].length, match[2]];
}

function SPLAT(match) {
  return ["SPLAT", match[1]];
}

function INTEGER(match) {
  return parseInt(match[0], 10);
}

function CONSTANT(match) {
  return JSON.parse(match[0]);
}
