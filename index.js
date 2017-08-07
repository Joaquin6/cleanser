'use strict';

const readdir = require('fs').readdir;
const pathJoin = require('path').join;

const async = require('async');
const rimraf = require('rimraf');

function Cleanser (dir, callback) {

  dir = dir || '.';

  async.waterfall([
    cb => readdir(dir, cb),
    (files, cb) => {
      if (files.length === 0) return cb();
      const filesDirs = files.map(file => pathJoin(dir, file));
      async.each(filesDirs, (fileDir, cb) => {
        // console.log(`\tCleaning Dir: ${fileDir}`);
        rimraf(fileDir, cb);
      }, cb);
    }
  ], callback);

}

module.exports = Cleanser;
module.exports.Cleanser = Cleanser;
module.exports.default = Cleanser;
