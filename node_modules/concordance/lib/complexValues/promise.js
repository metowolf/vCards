'use strict'

const constants = require('../constants')
const object = require('./object')

const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL

function describe (props) {
  return new DescribedPromiseValue(props)
}
exports.describe = describe

function deserialize (props) {
  return new DeserializedPromiseValue(props)
}
exports.deserialize = deserialize

const tag = Symbol('PromiseValue')
exports.tag = tag

class PromiseValue extends object.ObjectValue {}
Object.defineProperty(PromiseValue.prototype, 'tag', { value: tag })

class DescribedPromiseValue extends object.DescribedMixin(PromiseValue) {
  compare (expected) {
    // When comparing described promises, require them to be the exact same
    // object.
    return super.compare(expected) === DEEP_EQUAL
      ? DEEP_EQUAL
      : UNEQUAL
  }
}

class DeserializedPromiseValue extends object.DeserializedMixin(PromiseValue) {
  compare (expected) {
    // Deserialized promises can never be compared using object references.
    return super.compare(expected)
  }
}
