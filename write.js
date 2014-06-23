
module.exports = function toCode(value) {
  if (Array.isArray(value)) {
    var body = value;
    var open = "(";
    var close = ")";
    if (value[0].id === "list") {
      body = body.slice(1);
      open = "[";
      close = "]";
    }
    return open + body.map(toCode).join(" ") + close;
  }
  if (value.id) return value.id;
  return JSON.stringify(value.constant);
};
