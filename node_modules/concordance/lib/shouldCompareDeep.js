'use strict'

const argumentsObject = require('./complexValues/arguments').tag
const constants = require('./constants')

const AMBIGUOUS = constants.AMBIGUOUS
const SHALLOW_EQUAL = constants.SHALLOW_EQUAL

function shouldCompareDeep (result, lhs, rhs) {
  if (result === SHALLOW_EQUAL) return true
  if (result !== AMBIGUOUS) return false

  // Properties are only ambiguous if they have symbol keys. These properties
  // must be compared in an order-insensitive manner.
  return lhs.tag === argumentsObject || lhs.isProperty === true
}
module.exports = shouldCompareDeep
