const fs = require('fs');
const path = require('path');

const helpmsg = `
  Usage
    $ cleanser            Removes all files from the current folder.
    $ cleanser <path>     Removes all files from specified dir path.

  Options
    -c, --config          Pass in a configuration file location
    -i, --includes        Include source paths to delete
    -G, --ignore          Ignore source paths, avoid deletion

  Example
    $ cleanser . --includes coverage, package-lock.json
  `;

  module.exports = function(clear) {
    if (clear !== false) {
      process.stdout.write('\033[2J');
    }
    process.stdout.write('\033[0f');
  };


module.exports = {
  capitalizeFirstLetter: function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },
  clear: function(clear) {
    if (clear !== false) {
      process.stdout.write('\033[2J');
    }
    process.stdout.write('\033[0f');
  },
  directoryExists: function(filePath) {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  },
  getCurrentDirectoryBase: function() {
    return path.basename(process.cwd());
  },
  getHelpMessage: function() {
    return helpmsg;
  }
};
