"use strict";
var dialog = require('ui/dialog');

module.exports = {
  alert: alertForm,
  prompt: promptForm,
  confirm: confirmForm,
};

function dialogToString() {
  /*jshint validthis: true*/
  return "<<dialog " + this.name + ">>";
}

promptForm.toString = dialogToString;
function* promptForm() {
  /*jshint validthis: true*/
  var args = yield* this.list.apply(this, arguments);
  if (args.length < 1 || args.length > 2) {
    throw new Error("please pass in prompt message and optional value");
  }
  return yield function (callback) {
    dialog.prompt(args[0], args[1] || "", function (result) {
      callback(null, result);
    });
  };
}

alertForm.toString = dialogToString;
function* alertForm() {
  /*jshint validthis: true*/
  var args = yield* this.list.apply(this, arguments);
  if (args.length !== 2) {
    throw new Error("please pass in title and message");
  }
  return yield function (callback) {
    dialog.alert(args[0], args[1] || "", function () {
      callback(null, null);
    });
  };
}

confirmForm.toString = dialogToString;
function* confirmForm() {
  /*jshint validthis: true*/
  var args = yield* this.list.apply(this, arguments);
  if (args.length !== 1) {
    throw new Error("please pass in question to confirm");
  }
  return yield function (callback) {
    dialog.confirm(args[0], function (confirm) {
      callback(null, !!confirm);
    });
  };
}
