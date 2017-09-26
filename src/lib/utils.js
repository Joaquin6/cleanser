const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const Walker = require('walker');
const buglog = require('./buglog');

const debug = buglog('utils');
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
  /**
   * we’re going to be making our console application available globally.
   * This means we’ll want the name of the directory we’re working in,
   * not the directory where the application resides.
   * For this purpose it’s better to use `process.cwd`
   * @return {String} Name of the working directory
   */
  getCurrentDirectoryBase: function() {
    return path.basename(process.cwd());
  },
  getBaseDirectories: function(settings, callback) {
    const sources = {
      baseName: this.getCurrentDirectoryBase(),
      baseDirectory: process.cwd(),
      all: [],
      dirs: [],
      files: [],
      ignored: {
        all: [],
        dirs: [],
        files: []
      }
    };

    Walker(sources.baseDirectory)
    .filterDir(function(dir, stat) {
      if (_toSkip(dir, settings)) {
        debug(`\tSkipping ${chalk.blue.underline(dir)} and children`);
        sources.ignored.all.push(dir);
        if (fs.statSync(dir).isDirectory()) sources.ignored.dirs.push(dir);
        else sources.ignored.files.push(dir);
        return false
      }
      return true
    })
    .on('entry', function(entry, stat) {
      debug('\tGot entry: %s', chalk.green.underline(entry));
      /** @type {Boolean} Skip the current base directory */
      if (entry.endsWith(sources.baseName)) return;
      sources.all.push(entry);
      if (fs.statSync(entry).isDirectory()) sources.dirs.push(entry);
      else sources.files.push(entry);
    })
    .on('error', function(er, entry, stat) {
      debug('\n%s', chalk.green('Traversed Failed'));
      debug('Got error %s on entry %s', chalk.red(err), chalk.red(entry));
      callback(err);
    })
    .on('end', function() {
      debug('\t%s\n', chalk.green('All files successfully traversed'));
      callback(null, sources);
    });
  },
  getHelpMessage: function() {
    return helpmsg;
  }
};

function _toSkip(dir, settings) {
  const toIgnore = settings.ignore;

  for (let x = 0; x < toIgnore.length; x++) {
    let ig = toIgnore[x];
    if (dir.endsWith(ig) || dir.includes(ig))
      return true;
  }

  return false;
}
