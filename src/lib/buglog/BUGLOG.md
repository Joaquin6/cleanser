# debug
[![Build Status](https://travis-ci.org/visionmedia/debug.svg?branch=master)](https://travis-ci.org/visionmedia/debug)  [![Coverage Status](https://coveralls.io/repos/github/visionmedia/debug/badge.svg?branch=master)](https://coveralls.io/github/visionmedia/debug?branch=master)

A tiny node.js debugging utility modelled after node core's debugging technique.

## Usage

`debug` exposes a function; simply pass this function the name of your module, and it will return a decorated version of `console.error` for you to pass debug statements to. This will allow you to toggle the debug output for different parts of your module as well as the module as a whole.

Example _app.js_:

```js
var debug = require('debug')('http')
  , http = require('http')
  , name = 'My App';

// fake app

debug('booting %s', name);

http.createServer(function(req, res){
  debug(req.method + ' ' + req.url);
  res.end('hello\n');
}).listen(3000, function(){
  debug('listening');
});

// fake worker of some kind

require('./worker');
```

Example _worker.js_:

```js
var debug = require('debug')('worker');

setInterval(function(){
  debug('doing some work');
}, 1000);
```

 The __DEBUG__ environment variable is then used to enable these based on space or comma-delimited names. Here are some examples:

  ![debug http and worker](http://f.cl.ly/items/18471z1H402O24072r1J/Screenshot.png)

  ![debug worker](http://f.cl.ly/items/1X413v1a3M0d3C2c1E0i/Screenshot.png)

#### Windows note

 On Windows the environment variable is set using the `set` command.

 ```cmd
 set DEBUG=*,-not_this
 ```

 Note that PowerShell uses different syntax to set environment variables.

 ```cmd
 $env:DEBUG = "*,-not_this"
  ```

Then, run the program to be debugged as usual.

## Millisecond diff

  When actively developing an application it can be useful to see when the time spent between one `debug()` call and the next. Suppose for example you invoke `debug()` before requesting a resource, and after as well, the "+NNNms" will show you how much time was spent between calls.

  ![](http://f.cl.ly/items/2i3h1d3t121M2Z1A3Q0N/Screenshot.png)

  When stdout is not a TTY, `Date#toUTCString()` is used, making it more useful for logging the debug information as shown below:

  ![](http://f.cl.ly/items/112H3i0e0o0P0a2Q2r11/Screenshot.png)

## Conventions

  If you're using this in one or more of your libraries, you _should_ use the name of your library so that developers may toggle debugging as desired without guessing names. If you have more than one debuggers you _should_ prefix them with your library name and use ":" to separate features. For example "bodyParser" from Connect would then be "connect:bodyParser".

## Wildcards

  The `*` character may be used as a wildcard. Suppose for example your library has debuggers named "connect:bodyParser", "connect:compress", "connect:session", instead of listing all three with `DEBUG=connect:bodyParser,connect:compress,connect:session`, you may simply do `DEBUG=connect:*`, or to run everything using this module simply use `DEBUG=*`.

  You can also exclude specific debuggers by prefixing them with a "-" character.  For example, `DEBUG=*,-connect:*` would include all debuggers except those starting with "connect:".

## Environment Variables

  When running through Node.js, you can set a few environment variables that will
  change the behavior of the debug logging:

| Name      | Purpose                                         |
|-----------|-------------------------------------------------|
| `DEBUG`   | Enables/disabled specific debugging namespaces. |
| `DEBUG_COLORS`| Whether or not to use colors in the debug output. |
| `DEBUG_DEPTH` | Object inspection depth. |
| `DEBUG_SHOW_HIDDEN` | Shows hidden properties on inspected objects. |


  __Note:__ The environment variables beginning with `DEBUG_` end up being
  converted into an Options object that gets used with `%o`/`%O` formatters.
  See the Node.js documentation for
  [`util.inspect()`](https://nodejs.org/api/util.html#util_util_inspect_object_options)
  for the complete list.

## Formatters


  Debug uses [printf-style](https://wikipedia.org/wiki/Printf_format_string) formatting. Below are the officially supported formatters:

| Formatter | Representation |
|-----------|----------------|
| `%O`      | Pretty-print an Object on multiple lines. |
| `%o`      | Pretty-print an Object all on a single line. |
| `%s`      | String. |
| `%d`      | Number (both integer and float). |
| `%j`      | JSON. Replaced with the string '[Circular]' if the argument contains circular references. |
| `%%`      | Single percent sign ('%'). This does not consume an argument. |

## Output streams

  By default `debug` will log to stderr, however this can be configured per-namespace by overriding the `log` method:

Example _stdout.js_:

```js
var debug = require('debug');
var error = debug('app:error');

// by default stderr is used
error('goes to stderr!');

var log = debug('app:log');
// set this namespace to log via console.log
log.log = console.log.bind(console); // don't forget to bind to console!
log('goes to stdout');
error('still goes to stderr!');

// set all output to go via console.info
// overrides all per-namespace log settings
debug.log = console.info.bind(console);
error('now goes to stdout via console.info');
log('still goes to stdout, but via console.info now');
```
