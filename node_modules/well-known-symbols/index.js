'use strict'

// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Well-known_symbols
const WELL_KNOWN = new Map([
  [Symbol.iterator, 'Symbol.iterator'],
  [Symbol.asyncIterator, 'Symbol.asyncIterator'],
  [Symbol.match, 'Symbol.match'],
  [Symbol.replace, 'Symbol.replace'],
  [Symbol.search, 'Symbol.search'],
  [Symbol.split, 'Symbol.split'],
  [Symbol.hasInstance, 'Symbol.hasInstance'],
  [Symbol.isConcatSpreadable, 'Symbol.isConcatSpreadable'],
  [Symbol.unscopables, 'Symbol.unscopables'],
  [Symbol.species, 'Symbol.species'],
  [Symbol.toPrimitive, 'Symbol.toPrimitive'],
  [Symbol.toStringTag, 'Symbol.toStringTag']
].filter(entry => entry[0]))

exports.isWellKnown = symbol => WELL_KNOWN.has(symbol)
exports.getLabel = symbol => WELL_KNOWN.get(symbol)
