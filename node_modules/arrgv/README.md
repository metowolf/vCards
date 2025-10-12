# Arrgv

Parsing string to array of args like node on bash do.

[![Build Status][travis-image]][travis-url]
[![NPM version][npm-image]][npm-url]

When you type something like `node script.js bla bla bla` in shell and do `myArgs = process.argv.slice(2)` you get the same. All slashes, quotes and special symbols are handled same way.

## Install

```bash
npm install arrgv
```

## Tests

```bash
$ npm test
```

## Use cases

1. `spawn` a command that is given as a string
2. test `argv` parser with complicated example string
3. something else

## Example

```js
var arrgv = require('arrgv');
var str = '-param --format="hh:mm:ss" filename.ext';
console.log(arrgv(str));
/*
['-param',
 '--format=hh:mm:ss',
 'filename.ext' ]
*/
```

## License

MIT

[travis-url]: https://travis-ci.org/astur/arrgv
[travis-image]: https://travis-ci.org/astur/arrgv.svg?branch=master
[npm-url]: https://npmjs.org/package/arrgv
[npm-image]: https://badge.fury.io/js/arrgv.svg