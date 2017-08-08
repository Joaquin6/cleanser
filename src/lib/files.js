const statSync = require('fs').statSync;
const basename = require('path').basename;

module.exports = {
  getCurrentDirectoryBase: function() {
    return basename(process.cwd());
  },
  directoryExists: function(filePath) {
    try {
      return statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  }
};
