'use strict';

var util = require('util');
var Console = require('console').Console;
var supportsColor = require('color-support');

var console = new Console({
  stdout: process.stdout,
  stderr: process.stderr,
  colorMode: false,
});

function hasFlag(flag) {
  return process.argv.indexOf('--' + flag) !== -1;
}

function hasColors() {
  if (hasFlag('no-color')) {
    return false;
  }

  if (hasFlag('color')) {
    return true;
  }

  if (supportsColor()) {
    return true;
  }

  return false;
}

function Timestamp() {
  this.now = new Date();
}

Timestamp.prototype[util.inspect.custom] = function (depth, opts) {
  var timestamp = this.now.toLocaleTimeString('en', { hour12: false });
  return '[' + opts.stylize(timestamp, 'date') + ']';
};

function getTimestamp() {
  return util.inspect(new Timestamp(), { colors: hasColors() });
}

function log() {
  var time = getTimestamp();
  process.stdout.write(time + ' ');
  console.log.apply(console, arguments);
  return this;
}

function info() {
  var time = getTimestamp();
  process.stdout.write(time + ' ');
  console.info.apply(console, arguments);
  return this;
}

function dir() {
  var time = getTimestamp();
  process.stdout.write(time + ' ');
  console.dir.apply(console, arguments);
  return this;
}

function warn() {
  var time = getTimestamp();
  process.stderr.write(time + ' ');
  console.warn.apply(console, arguments);
  return this;
}

function error() {
  var time = getTimestamp();
  process.stderr.write(time + ' ');
  console.error.apply(console, arguments);
  return this;
}

module.exports = log;
module.exports.info = info;
module.exports.dir = dir;
module.exports.warn = warn;
module.exports.error = error;
