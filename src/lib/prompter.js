const _ = require('underscore');
const async = require('async');
const colors = require('colors');
const inquirer = require('inquirer');

let exitCode = 7;

function nonExitSelected(answers) {
  return (answers.envOptions !== "exit" && answers.migrationOptions !== "exit");
}

function getEnvOptions () {
  return {
    name: 'envOptions',
    type: 'list',
    message: 'Choose an Environment',
    choices: [{
      name: "Test",
      value: "test"
    }, {
      name: "Development",
      value: "development"
    }, {
      name: "Production",
      value: "production"
    }, {
      name: "Exit",
      value: "exit"
    }],
    default: "test"
  };
}

function getMigrationOptions () {
  return {
    name: 'migrationOptions',
    type: 'list',
    message: 'Migration Purpose',
    choices: ["Create", "Up", "Down", "Reset", "Exit"],
    filter: function(val) {
      return val.toLowerCase();
    },
    when: function(answers) {
      return answers.envOptions !== "exit";
    }
  };
}

function getConfirmations () {
  let confirmations = [
    getConfirmSQLFiles(),
    getSlackConfirmation(), {
      name: 'logConfirmation',
      type: 'confirm',
      message: 'Enable Log Output?',
      default: false,
      when: nonExitSelected
    }, {
      name: 'logDirectory',
      type: 'input',
      message: 'Enter Log Dir',
      default: 'logs',
      when: function(answers) {
        return answers.logConfirmation === true;
      },
      validate: function(value) {
        let pass = value.match(/^(\d{1,2}|\d{8})$/i);
        if (pass)
          return true;
        return 'Please enter a valid Migration Count OR Date Format (YYYYMMDD)';
      }
    }, {
      name: 'createMigrationName',
      type: 'input',
      message: 'Enter Migration Name',
      default: "Create-Migration",
      when: function(answers) {
        return answers.migrationOptions === "create";
      }
    }, {
      name: 'migrationCount',
      type: 'input',
      message: 'Enter Migration Count',
      filter: Number,
      when: function(answers) {
        if (answers.migrationOptions === "up" || answers.migrationOptions === "down")
          return true;
        return false;
      },
      validate: function(value) {
        if (!value)
          return true;
        let pass = value.match(/^(\d{1,2}|\d{8})$/i);
        if (pass)
          return true;
        return 'Please enter a valid Migration Count OR Date Format (YYYYMMDD)';
      }
    }
  ];
  return confirmations;
}

function getInitialQuestions (cleanser) {
  let fileChoices = [new inquirer.Separator(' = Files = ')];
  let directoryChoices = [new inquirer.Separator(' = Directories = ')];
  const sourcePaths = cleanser.getSourcePaths();
  const defaultConfigs = cleanser.getDefaultConfigs();

  for (let f = 0; f < defaultConfigs.ignore.length; f++) {
    const ignoredSrc = defaultConfigs.ignore[f];

    for (let g = 0; g < sourcePaths.removing.length; g++) {
      const removingSrcPath = sourcePaths.removing[g];
      const removingSrc = removingSrcPath.split('/').pop();

      if (removingSrc !== ignoredSrc) continue;

      const choice = {
        name: removingSrc,
        value: removingSrcPath
      };

      if (_.find(sourcePaths.directories, dir => dir === removingSrcPath)) {
        directoryChoices.push(choice);
        continue;
      }
      fileChoices.push(choice);
    }
  }

  let choices = [];
  if (directoryChoices.length > 1 && fileChoices.length > 1)
    choices = directoryChoices.concat(fileChoices);
  else if (directoryChoices.length < 2 && fileChoices.length > 1)
    choices = fileChoices;
  else if (directoryChoices.length > 1 && fileChoices.length < 2)
    choices = directoryChoices;

  return {
    name: 'dblChkSrcRemoval',
    type: 'checkbox',
    message: 'Deleting the following is NOT Recommended, select them to delete anyway:',
    choices: choices
  };
}

function getConfirmSQLFiles () {
  return {
    name: 'sqlFilesConfirmation',
    type: 'confirm',
    message: 'Include SQL (.sql) Files?',
    default: true,
    when: nonExitSelected
  };
}

function getSlackConfirmation () {
  return {
    name: 'notifySlack',
    type: 'confirm',
    message: 'Want Results to be sent to Slack?',
    default: false,
    when: nonExitSelected
  };
}

module.exports = {
  getInitialQuestions,
  getConfirmations,
  getEnvOptions,
  getMigrationOptions,
  getConfirmSQLFiles,
  getSlackConfirmation
}
