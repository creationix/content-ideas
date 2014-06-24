"use strict";

module.exports = function error(token, name, message, CustomError) {
  name = name || __filename;
  if (!message) throw new TypeError("error handler requires message");
  message = message || "";
  if (!token || typeof token !== "object" || !token.scope) {
    throw message;
  }
  CustomError = CustomError || Error;
  var string = token.scope.string;
  var filename = token.scope.filename;
  var offset = token.offset;
  var before = string.substring(0, offset).split("\n");
  var after = string.substring(offset).split("\n");
  var line = before.pop() || "";
  var column = line.length;
  line += after.shift() || "";
  var row = before.length;
  var above = before.pop() || "";
  var below = after.shift() || "";
  var indent = "";
  for (var i = 0; i < column; i++) {
    indent += "-";
  }
  return new CustomError(name + " at (" + filename + ":" + (row + 1) + ":" + (column + 1) + ")\n" +
    above + "\n" +
    line + "\n" +
    indent + "^ " + message + "\n" +
    below
  );
};
