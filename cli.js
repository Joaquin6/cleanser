#!/usr/bin/env node

const colors = require('colors');
const chalk = require('chalk');
const supportsColor = require('supports-color');
const clear = require('clear');
const CLI = require('clui');
const figlet = require('figlet');
const inquirer = require('inquirer');
const Spinner = CLI.Spinner;
const meow = require('meow');
const _ = require('underscore');
const Utility = require('./src/lib/utils');
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

function commenceIntroduction() {
  if (supportsColor)
    debug('Terminal supports color');
  if (supportsColor.has256)
    debug('Terminal supports 256 colors');
  if (supportsColor.has16m)
    debug('Terminal supports 16 million colors (truecolor)');
  debug('Commensing Introduction');
  return new Promise((resolve, reject) => {
    clear();

    if (process.env.DEBUG && process.env.DEBUG.includes(pkgname)) {
      Error.stackTraceLimit = 50;
    }

    figlet.text(Utility.capitalizeFirstLetter(pkgname), {
      horizontalLayout: 'full'
    }, (err, data) => {
      if (err) throw err;
      console.log(chalk.yellow(data));
      resolve();
    });
  });
}

function initializeCleanser() {
  debug('Initializing Cleanser');
  return new Promise(resolve => {
    const cli = meow({
      alias: {
        c: 'config',
        i: 'includes'
      },
      help: helpmsg
    });
    debug('CLI Object: %O', cli);
    if (cli.input[0] === 'help') {
      resolve(cli.showHelp(0));
    } else {
      cleanser = new Cleanser(cli.input[0], err => {
        if (err) throw err;
        resolve();
      });
    }
  });
}

function promptQuestions() {
  debug('Prompting Questions');
  return new Promise((resolve, reject) => {
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
            if (err) return reject(err);
            return sourcePaths;
          });
        }
        return cleanser.getSourcePaths();
      })
      .then(removeSources)
      .then(resolve)
      .catch(reject);
    } else removeSources().then(resolve).catch(reject);
  });
}

function removeSources() {
  return new Promise((resolve, reject) => {
    const status = new Spinner("Running Cleanser.....");
    status.start();
    cleanser.removeSourcePaths(err => {
      status.stop();
      if (err) return reject(err);
      resolve(null, {
        toExit: true
      });
    });
  });
}

function answersHandler(err, res = {}) {
  return new Promise((resolve, reject) => {
      if (err) {
          debug('An error has Occurred: ', err);
      } else {
          let msg = 'All done!';
          if (res.message) msg = res.message;
          debug(colors.green(msg));
      }
      if (res && res.toExit)
          process.exit(0);
      return promptQuestions();
  });
}

commenceIntroduction()
  .then(initializeCleanser)
  .then(promptQuestions)
  .then(answersHandler)
  .catch(err => {
    debug('%s: %O', colors.red('Cleanser CLI Error'), err);
    process.exit(0);
  });
