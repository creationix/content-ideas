var tokenize = require('../tokenizer')(require('./tokens'));
var parse = require('./parser');

module.exports = function (code) {
  return parse(tokenize(code));
};
