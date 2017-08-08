#!/usr/bin/env node

const colors = require('colors');
const clear = require('clear');
const CLI = require('clui');
const figlet = require('figlet');
const inquirer = require('inquirer');
const Spinner = CLI.Spinner;
const meow = require('meow');
const _ = require('underscore');
const prompter = require('./src/lib/prompter');
const Cleanser = require('.');
const pkgname = require('./package.json').name;
const debug = require('debug')(pkgname);

let helpmsg = `
  Usage
    $ cleandir            Removes all files from the current folder.
    $ cleandir <path>     Removes all files from specified dir path.

  Options
    -c, --config          Pass in a configuration file location
    -i, --includes        Include source paths to delete
    -G, --ignore          Ignore source paths, avoid deletion

  Example
    $ cleandir . --includes coverage, package-lock.json
  `;
let cleanser, cli;

function getCLI() {
  const cli = meow({
    alias: {
      c: 'config',
      i: 'includes'
    },
    help: helpmsg
  });

  return cli;
}

function removeSources(callback) {
  const status = new Spinner("Running Cleanser.....");
  status.start();

  cleanser.removeSourcePaths(err => {
    status.stop();
    if (err) return callback(err);
    callback(null, {
      toExit: true
    });
  });
}

function commenceIntroduction() {
  clear();
  console.log(
    colors.yellow(
      figlet.textSync('Cleanser', {
        horizontalLayout: 'full'
      })
    )
  );
  if (process.env.DEBUG && process.env.DEBUG.includes(pkgname))
    Error.stackTraceLimit = 50;
}

function promptQuestions(callback) {
  /**
   * Prompt questions to double check that the include paths are
   * in fact suppose to be deleted. This is just an extra check for
   * the end user to confirm.
   */
  const dblcheck = prompter.getInitialQuestions(cleanser);

  /**
   * Only prompt the question if there are choices to check from.
   */
  if (!_.isEmpty(dblcheck.choices)) {
    inquirer.prompt(dblcheck)
    .then(answers => {
      if (!_.isEmpty(answers)) {
        debug('Moving these to Ignore: %O', answers.dblChkSrcRemoval);
        return cleanser.moveToIgnore(answers.dblChkSrcRemoval, (err, sourcePaths) => {
          if (err) return callback(err);
          return sourcePaths;
        });
      }
      return cleanser.getSourcePaths();
    })
    .then(() => removeSources(callback))
    .catch(callback);
  } else {
    removeSources(callback);
  }
}

function initializeCleanser(callback) {
  cli = getCLI();
  debug('CLI Object: %O', cli);
  if (cli.input[0] === 'help') {
    return cli.showHelp(0);
  }
  cleanser = new Cleanser(cli.input[0], callback);
}

function answersCallback(err, res) {
    if (err) {
        debug('An error has Occurred: ', err);
    } else {
        let msg = 'All done!';
        if (res.message) msg = res.message;
        debug(colors.green(msg));
    }
    if (res && res.toExit)
        process.exit(0);
    else
        promptQuestions(answersCallback);
}

commenceIntroduction();
initializeCleanser(err => {
  if (err) {
    debug('%s: %O', colors.red('Cleanser CLI Error'), err);
    process.exit(0);
  }
  promptQuestions(answersCallback);
});
