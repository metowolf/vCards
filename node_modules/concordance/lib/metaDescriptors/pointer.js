'use strict'

const UNEQUAL = require('../constants').UNEQUAL

function describe (index) {
  return new Pointer(index)
}
exports.describe = describe

exports.deserialize = describe

const tag = Symbol('Pointer')
exports.tag = tag

class Pointer {
  constructor (index) {
    this.index = index
  }

  // Pointers cannot be compared, and are not expected to be part of the
  // comparisons.
  compare (expected) {
    return UNEQUAL
  }

  serialize () {
    return this.index
  }
}
Object.defineProperty(Pointer.prototype, 'isPointer', { value: true })
Object.defineProperty(Pointer.prototype, 'tag', { value: tag })
