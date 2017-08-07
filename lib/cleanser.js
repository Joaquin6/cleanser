'use strict';

const readdir = require('fs').readdir;
const pathJoin = require('path').join;

const waterfall = require('async').waterfall;
const rimraf = require('rimraf');

function Cleanser(dir, callback) => {

  dir = dir || '.';

  waterfall([
    function (cb) => {
      readdir(dir, cb)
    },
    function (files, cb) => {
      if (files.length === 0) return cb();
      rimraf(files.map(file => pathJoin(dir, file)), cb);
    }
  ], callback);

}

module.exports = Cleanser;
module.exports.Cleanser = Cleanser;
module.exports.default = Cleanser;
