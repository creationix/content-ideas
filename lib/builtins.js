var exec = require('../exec');

module.exports = {
  def: defForm
};

defForm.raw = true;
function* defForm(name, value) {
  /*jshint validthis:true noyield:true*/
  if (Array.isArray(name)) {
    throw "TODO: Implement shorthand lamda definition";
  }
  if (!name.id) {
    throw "First arg to def must be list or variable";
  }
  if (this.hasOwnProperty(name.id)) {
    throw "Cann't redefine local variable '" + name.id + "'";
  }
  return (this[name.id] = yield* exec.call(this, value));
}