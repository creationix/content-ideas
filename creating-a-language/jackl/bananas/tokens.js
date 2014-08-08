"use strict";

module.exports = [
  COMMENT,  /^--(.*)/,
  INTEGER,  /^(?:0|-?[1-9][0-9]*)/,
  TEXT,     /^(?:"(?:[^"\\]|\\.|\s)*")/,
  CONSTANT, /^(?:true|false|null)\b/,
  ID,       /^(:*)([^\s()[\]{}",'`:;#|\\.…]+)(\.\.\.|…)?/,
  undefined,/^\s+/, // Skip whitespace
];

function COMMENT(match) {
  return ['COMMENT', match[1]];
}

function TEXT(match) {
  return ["TEXT", JSON.parse(match[0])];
}

function ID(match) {
  var depth = match[1].length;
  var splat = !!match[3];
  var name = match[2];
  if (name === "lambda") name = "λ";
  return splat ? ["ID", name, depth, splat] :
         depth ? ["ID", name, depth] :
                 ["ID", name];
}

function INTEGER(match) {
  return parseInt(match[0], 10);
}

function CONSTANT(match) {
  return JSON.parse(match[0]);
}
