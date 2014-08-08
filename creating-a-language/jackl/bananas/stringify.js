var listId = require('./id')("list");

module.exports = function toCode(value) {
  if (Array.isArray(value)) {
    var body = value;
    var open = "(";
    var close = ")";
    if (value[0] === listId) {
      body = body.slice(1);
      open = "[";
      close = "]";
    }
    return open + body.map(toCode).join(" ") + close;
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return String(value);
};
