'use strict';

const readdir = require('fs').readdir;
const statsSync = require('fs').statSync;
const pathJoin = require('path').join;

let pkgname = require('./package.json').name;

const _ = require('underscore');
const async = require('async');
const rimraf = require('rimraf');
const debug = require('debug')(pkgname);

const defaultOptions = {
  dir: '.',
  ignore: [
    '.git',
    '.github',
    '.gitlab',
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
    'package-lock.json',
    'yarn-error.log',
    'logs',
    'node_modules'
  ]
};

function _getConfigOptions(options) {
  debug(`\nUser Options: ${JSON.stringify(options, null, 4)}`);
  let opts = require('rc')(pkgname, defaultOptions);

  if (_.isObject(options))
    opts = _.extend(opts, options);
  else if (_.isString(options)) {
    opts = _.extend(opts, {
      dir: options
    });
  }

  debug(`\nUsing Options:\n%O`, opts);
  return opts;
}

function Cleanser (dir, callback) {
  const opts = _getConfigOptions(dir);

  async.waterfall([
    cb => readdir(opts.dir, cb),
    (files, cb) => {
      if (files.length === 0) return cb();
      let filesDirs = [];

      for (let x = 0; x < files.length; x++) {
        let src = pathJoin(opts.dir, files[x]);
        const stats = statsSync(src);

        if (stats.isDirectory() && src === pkgname)
          continue;
        if (stats.isDirectory() && _.findIndex(opts.ignore, src))
          continue;
        if (_.findIndex(opts.include, src))
          filesDirs.push(src);
      }

      async.each(filesDirs, (src, cb) => {
        debug('Deleting Source Path: %s', src);
        rimraf(src, cb);
      }, cb);
    }
  ], callback);

}

module.exports = Cleanser;
module.exports.Cleanser = Cleanser;
module.exports.default = Cleanser;
