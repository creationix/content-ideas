"use strict";

var idCache = {};
exports = module.exports = makeId;
exports.isId = function (value) {
  return value instanceof Id;
};
exports.isVar = function (value) {
  return value instanceof Id && value.depth === 0;
};


function makeId(name, depth, splat) {
  depth = depth|0;
  splat = !!splat;
  name = String(name);
  var key = name + "\0" + depth + "\0" + splat;
  return idCache[key] || (idCache[key] = new Id(name, depth, splat));
}

function Id(name, depth, splat) {
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
