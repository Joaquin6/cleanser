/*global describe, it, before */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const meow = require('meow');

const Cleanser = require('../');

/**
 * Defines some test file names to be used on tests
 * @type {Array}
 */
const files = [
  path.join('.tmp', 'README.md'),
  path.join('.tmp', 'package.json'),
  path.join('.tmp', '.gitignore')
];

let helpmsg = `
  Usage
    $ cleanser            Removes all files from the current folder.
    $ cleanser <path>     Removes all files from specified dir path.

  Options
    -c, --config          Pass in a configuration file location
    -i, --includes        Include source paths to delete

  Example
    $ cleanser . --includes coverage, package-lock.json
  `;
let cleanser, cli;

function getCLI() {
  const cli = meow({
    alias: {
      c: 'config',
      i: 'includes'
    },
    argv: ['.tmp'],
    help: helpmsg,
    input: ['.tmp']
  });

  return cli;
}

function mkTempDir() {
  /**
   * creates a .tmp folder
   */
  fs.mkdirSync('.tmp');
  /**
   * writes some test files
   */
  files.forEach(function (filename) {
    fs.writeFileSync(filename, '');
  });
}

describe('cleanser', function () {
  this.timeout(20000);

  before(function () {
    mkTempDir();
    cli = getCLI();
  });

  it('should setup accordingly', function (done) {
    assert.equal(cli.input[0], '.tmp');
    cleanser = new Cleanser(cli.input[0], function (err) {
      assert.ifError(err);
      done();
    });
  });

  it('should clean a directory', function (done) {
    assert.equal(fs.readdirSync('.tmp').length, 3);
    cleanser.removeSourcePaths(function () {
      assert.equal(fs.readdirSync('.tmp').length, 0);
      fs.rmdirSync('.tmp');
      done();
    });
  });

  it('should do nothing if directory is already clean', function (done) {
    mkTempDir();
    /**
     * cleans up .tmp folder
     */
    files.forEach(function (filename) {
      fs.unlinkSync(filename);
    });
    /**
     * tests an empty folder
     */
    cleanser.removeSourcePaths(function () {
      assert(true, 'Does not throw errors');
      fs.rmdirSync('.tmp');
      done();
    });
  });
});
