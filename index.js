'use strict';

const readdir = require('fs').readdir;
const statSync = require('fs').statSync;
const pathJoin = require('path').join;
const pathResolve = require('path').resolve;
const _ = require('underscore');
const colors = require('colors');
const async = require('async');
const rimraf = require('rimraf');
const pkgname = require('./package.json').name;
const debug = require('debug')(pkgname);

function _validateParentModule(options) {
  const srcPath = pathResolve(options.dir, '..', '..');
  let src = srcPath.split('/').pop() || null;

  debug('Module Source: %s', src);
  debug('Module Source Path: %s', srcPath);

  if (src === 'node_modules')
    src = pathResolve(options.dir, '..', '..', '..');
  return null;
}

class Cleanser {
  constructor (dir, callback) {
    this.setup = false;
    this.name = pkgname;
    this.config = {
      dir: '.',
      ignore: [
        '.git',
        '.github',
        '.gitlab',
        '.cleanserrc',
        '.travis.yml',
        pkgname,
        'package.json',
        'server.js',
        'index.js',
        '*.md',
        'LICENSE'
      ],
      include: [
        '.idea',
        '.DS_Store',
        '.tmp',
        'npm-debug.log',
        'yarn-error.log'
      ]
    };
    this.sourcePaths = {
      directories: [],
      files: [],
      removing: [],
      ignoring: []
    };
    this.suppliedOptions = dir;

    this.getDefaultConfigs = _.bind(this.getDefaultConfigs, this);
    this.getSourcePaths = _.bind(this.getSourcePaths, this);
    this.getOptions = _.bind(this.getOptions, this);
    this.setConfigurations = _.bind(this.setConfigurations, this);
    this.setSourcePaths = _.bind(this.setSourcePaths, this);
    this.setSourcePath = _.bind(this.setSourcePath, this);
    this.removeSourcePaths = _.bind(this.removeSourcePaths, this);
    this.start = _.bind(this.start, this);

    this.start(callback);
  }

  setConfigurations (callback) {
    debug(`\nSupplied Options: %O`, this.suppliedOptions);
    this.options = require('rc')(this.name, this.config);

    if (_.isObject(this.suppliedOptions))
      this.options = _.extend(this.options, this.suppliedOptions);
    else if (_.isString(this.suppliedOptions)) {
      this.options = _.extend(this.options, {
        dir: this.suppliedOptions
      });
    }

    callback(null, this.options);
  }

  getDefaultConfigs () {
    return this.config;
  }

  getSourcePaths () {
    return this.sourcePaths;
  }

  getOptions () {
    return this.options;
  }

  moveToIgnore (sources, callback) {
    let self = this;

    async.each(sources, (src, cb) => {
      let index = _.findIndex(self.sourcePaths.removing, src);
      self.sourcePaths.removing.splice(index, 1);
      self.sourcePaths.ignoring.push(src);
      cb();
    }, err => {
      if (err) {
        debug('A file failed to process');
        return callback(err);
      }
      debug('Source files are now ignored');
      callback(null, self.sourcePaths);
    });
  }

  setSourcePaths (callback) {
    const self = this;
    const pm = _validateParentModule(this.options);
    if (pm) this.options.dir = pm;

    readdir(this.options.dir, (err, files) => {
      if (err) return callback(err);
      if (files.length === 0) return callback(null, 'Directory is Already Empty');
      async.each(files, self.setSourcePath, callback);
    });
  }

  setSourcePath (file, callback) {
    let src = pathJoin(this.options.dir, file);
    const stats = statSync(src);

    if (stats.isDirectory()) {
      this.sourcePaths.directories.push(src);
    } else {
      this.sourcePaths.files.push(src);
    }

    let found = _.find(this.options.ignore, (source) => {
      return source === src;
    });

    if (file === this.name || found) {
      debug('Ignoring Source Path: %s', src);
      this.sourcePaths.ignoring.push(src);
      return callback(null);
    }

    found = _.find(this.options.include, (source) => {
      return (source === src || src.startsWith(source));
    });

    if (found) this.sourcePaths.removing.push(src);
    callback(null);
  }

  removeSourcePaths (callback) {
    debug('Source Paths:\n%O\n', this.sourcePaths);
    async.each(this.sourcePaths.removing, (src, cb) => {
      debug('Deleting Source Path: %s', src);
      rimraf(src, cb);
    }, callback);
  }

  start (callback) {
    const self = this;

    async.series([
      this.setConfigurations,
      this.setSourcePaths
    ], err => {
      if (err) {
        debug('%s: %O', colors.red('Cleanser Error'), err);
        return callback(err);
      }
      debug('Cleanser Setup Complete');
      self.setup = true;
      debug(`\nUsing Options:\n%O`, self.options);
      callback();
    });
  }
}

module.exports = Cleanser;
module.exports.Cleanser = Cleanser;
module.exports.default = Cleanser;
