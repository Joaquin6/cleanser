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
$ cleandir
```

Cleans a given directory:

```sh
$ cleandir ~/path-to-clean
```

Displays the help message:

```sh
$ cleandir --help
```


### Programmatic API

```js
var cleandir = require('clean-dir');

cleandir('~/path-to-clean', function (err) {});
```


## License

ISC © [Joaquin Briceno](http://joaquinbriceno.com/)

[npm-url]: https://www.npmjs.com/package/cleanser
[npm-image]: https://badge.fury.io/js/clean-dir.svg
[travis-url]: https://travis-ci.org/ruyadorno/clean-dir
[travis-image]: https://travis-ci.org/ruyadorno/clean-dir.svg?branch=master
[rimraf-url]: https://www.npmjs.com/package/rimraf
