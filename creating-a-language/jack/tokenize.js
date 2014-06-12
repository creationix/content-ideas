"use strict";

module.exports = function (rules) {
  return function (string) {
    var tokens = [];
    var length = rules.length;
    if (rules.postfix) string += rules.postfix;
    while (string) {
      var match, token;
      for (var i = 0; i < length; i += 2) {
        match = string.match(rules[i + 1]);
        if (!match) continue;
        token = rules[i];
        if (typeof token === "function") {
          token = token(match);
        }
        break;
      }
      if (match) {
        string = string.substring(match[0].length);
        if (token) tokens.push(token);
      }
      else {
        tokens.push(string[0]);
        string = string.substring(1);
      }
    }
    tokens.push("EOF");
    return tokens;
  };
};
