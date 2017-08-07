# cleanser

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]

> A utility to safely clean a directory from clutter such as log files, modules, generated tests and more.


## About

This small command line tool uses [rimraf][rimraf-url] to safely clean the directory specified from clutter.


## Install

```sh
$ npm install -g cleanser
```


## Usage

### Command-line

Cleans up the current working directory:

```sh
$ cleanser
```

Cleans a given directory:

```sh
$ cleanser ~/path-to-clean
```

Displays the help message:

```sh
$ cleanser --help
```


### Programmatic API

```js
var cleanser = require('cleanser');

cleanser('~/path-to-clean', function (err) {});
```


## License

ISC © [Joaquin Briceno](http://joaquinbriceno.com/)

[npm-url]: https://www.npmjs.com/package/cleanser
[npm-image]: https://badge.fury.io/js/cleanser.svg
[travis-url]: https://travis-ci.org/ruyadorno/cleanser
[travis-image]: https://travis-ci.org/ruyadorno/cleanser.svg?branch=master
[rimraf-url]: https://www.npmjs.com/package/rimraf
