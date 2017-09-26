#!/usr/bin/env node

/**
 * By default, we will always force colors on the terminal
 * @type {Number}
 */
process.env.FORCE_COLOR = 1;

const colors = require('colors'),
  chalk = require('chalk'),
  CLI = require('clui'),
  figlet = require('figlet'),
  inquirer = require('inquirer'),
  Spinner = CLI.Spinner,
  meow = require('meow'),
  _ = require('underscore'),
  buglog = require('./src/lib/buglog'),
  Utility = require('./src/lib/utils'),
  prompter = require('./src/lib/prompter'),
  supportsColor = require('./src/lib/supports-color'),
  defaultConfigs = require('./config.json'),
  Cleanser = require('.'),
  pkgname = 'cleanser',
  debug = buglog('cli'),
  dirBaseRcExists = false;

let cleanser, cli, dirBase, baseDirs;

function readEnvironment() {
  debug('Reading Environment');
  return new Promise((resolve, reject) => {
    /** Check if terminal supports colors */
    if (supportsColor) {
      debug('\n%s: %o\n', chalk.green('Terminal supports colors'), supportsColor);
      if (supportsColor.hasBasic)
        debug('%s', chalk.green('Terminal supports basic colors'));
      if (supportsColor.has256)
        debug('%s', chalk.green('Terminal supports 256 colors'));
      if (supportsColor.has16m)
        debug('%s', chalk.green('Terminal supports 16 million colors (truecolor)'));
    } else debug('\nTerminal doesn\'t supports colors: %o\n', supportsColor);

    debug(`Working Directory: ${chalk.yellow(process.cwd())}`);

    /** Get the Current Dir Base */
    dirBase = Utility.getCurrentDirectoryBase();
    debug('%s: %s\n', chalk.green('Working Directory Base'), chalk.blue.bold(dirBase));

    /** Determine if the current dir base has an RC file */
    let dirBaseRcExistsResult = chalk.red('false');
    if (Utility.directoryExists('.cleanserrc')) {
      dirBaseRcExists = true;
      dirBaseRcExistsResult = chalk.green('true');
    }
    debug(`Working Directory Contains a ${chalk.blue.bold('.cleanserrc')} File: %s\n`, dirBaseRcExistsResult);

    /** Get Current Base Directories */
    Utility.getBaseDirectories(defaultConfigs, function(err, sources) {
      if (err) return reject(err);
      baseDirs = sources;
      debug('\nCurrent Base Directories:\n%O\n', baseDirs);
      resolve(sources);
    });
  });
}

function commenceIntroduction() {
  debug(chalk.green('Commensing Introduction'));
  return new Promise((resolve, reject) => {
    Utility.clear();

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
      help: Utility.getHelpMessage()
    });

    debug('CLI Object:\n%O\n', cli);

    if (cli.input[0] === 'help') {
      return resolve(cli.showHelp(0));
    }

    cleanser = new Cleanser(cli.input[0], err => {
      if (err) throw err;
      resolve();
    });

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

readEnvironment()
  .then(commenceIntroduction)
  .then(initializeCleanser)
  .then(promptQuestions)
  .then(answersHandler)
  .catch(err => {
    debug('%s: %O', colors.red('Cleanser CLI Error'), err);
    process.exit(0);
  });
