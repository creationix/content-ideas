"use strict";

module.exports = {
  "for": forForm,
  "for*": forStarForm,
  "map": mapForm,
  "map*": mapStarForm,
  "shuffle": shuffleForm,
};

function iteratorToString() {
  /*jshint validthis: true*/
  return "<<iterator " + this.name + ">>";
}

forForm.toString = iteratorToString;
forForm.raw = true;
function* forForm(inputs, ...body) {
  /*jshint validthis: true*/
}

forStarForm.toString = iteratorToString;
forStarForm.raw = true;
function* forStarForm(inputs, ...body) {
  /*jshint validthis: true*/
  if (!Array.isArray(inputs)) {
    throw new Error("for inputs must be id/value pairs");
  }
  console.log(inputs);
}

mapForm.toString = iteratorToString;
mapForm.raw = true;
function* mapForm(inputs, ...body) {
  /*jshint validthis: true*/
}

mapStarForm.toString = iteratorToString;
mapStarForm.raw = true;
function* mapStarForm(inputs, ...body) {
  /*jshint validthis: true*/
}

shuffleForm.toString = iteratorToString;
function* shuffleForm(list) {
  /*jshint noyield:true*/
}
