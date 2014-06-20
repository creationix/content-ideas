var pathjoin = require('pathjoin');
var fs = require('data/fs');

// Wrapper around tedit's private APIs to provide access to the vfs.
module.exports = {
  readFile: readFile,
  relative: relative
};

function relative(dirname) {
  return {
    readFile: function readFileRelative(path, callback) {
      if (!callback) return readFileRelative.bind(null, path);
      if (path[0] === ".") {
        path = pathjoin(dirname, path);
      }
      return readFile(path, callback);
    }
  };
}

function readFile(path, callback) {
  if (!callback) return readFile.bind(null, path);
  fs.readEntry(path, function (err, entry) {
    if (!entry || !entry.hash) return callback(err);
    var repo = fs.findRepo(entry.root);
    repo.loadAs("text", entry.hash, callback);
  });
}
