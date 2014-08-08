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
function* promptForm(message, value) {
  /*jshint validthis: true*/
  if (arguments.length < 1 || arguments.length > 2) {
    throw new Error("please pass in prompt message and optional value");
  }
  return yield function (callback) {
    dialog.prompt(message, value || "", function (result) {
      callback(null, result);
    });
  };
}

alertForm.toString = dialogToString;
function* alertForm(title, message) {
  /*jshint validthis: true*/
  if (arguments.length !== 2) {
    throw new Error("please pass in title and message");
  }
  return yield function (callback) {
    dialog.alert(title, message, function () {
      callback(null, null);
    });
  };
}

confirmForm.toString = dialogToString;
function* confirmForm(question) {
  /*jshint validthis: true*/
  if (arguments.length !== 1) {
    throw new Error("please pass in question to confirm");
  }
  return yield function (callback) {
    dialog.confirm(question, function (confirm) {
      callback(null, !!confirm);
    });
  };
}
