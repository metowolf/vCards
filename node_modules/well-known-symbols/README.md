# well-known-symbols

Check whether a symbol is [well-known](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Well-known_symbols).

Requires Node.js 6 or above. Note that not all Node.js versions support the same
well-known symbols.

## Installation

```console
$ npm install --save well-known-symbols
```

## Usage

```js
const wellKnownSymbols = require('well-known-symbols')

wellKnownSymbols.isWellKnown(Symbol.iterator) // true
wellKnownSymbols.isWellKnown(Symbol()) // false

wellKnownSymbols.getLabel(Symbol.iterator) // 'Symbol.iterator'
wellKnownSymbols.getLabel(Symbol()) // undefined
```
