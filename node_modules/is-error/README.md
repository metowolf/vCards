# is-error

<!--
    [![build status][build-png]][build]
    [![Coverage Status][cover-png]][cover]
    [![Davis Dependency status][dep-png]][dep]
-->

<!-- [![NPM][npm-png]][npm] -->

Detect whether a value is an error

## Example

```js
var isError = require("is-error");

console.log(isError(new Error('hi'))) // true
console.log(isError({ message: 'hi' })) // false
```

## Docs

### `var bool = isError(maybeErr)`

```hs
is-error := (maybeErr: Any) => Boolean
```

`isError` returns a boolean. it will detect whether the argument
is an error or not.

## Installation

`npm install is-error`

## Tests

`npm test`

## Contributors

 - Raynos

## MIT Licensed

  [build-png]: https://secure.travis-ci.org/Raynos/is-error.png
  [build]: https://travis-ci.org/Raynos/is-error
  [cover-png]: https://coveralls.io/repos/Raynos/is-error/badge.png
  [cover]: https://coveralls.io/r/Raynos/is-error
  [dep-png]: https://david-dm.org/Raynos/is-error.png
  [dep]: https://david-dm.org/Raynos/is-error
  [npm-png]: https://nodei.co/npm/is-error.png?stars&downloads
  [npm]: https://nodei.co/npm/is-error
