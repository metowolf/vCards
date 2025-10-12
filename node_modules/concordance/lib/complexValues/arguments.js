'use strict'

const constants = require('../constants')
const object = require('./object')

const AMBIGUOUS = constants.AMBIGUOUS
const UNEQUAL = constants.UNEQUAL

function describe (props) {
  return new DescribedArgumentsValue(Object.assign({
    // Treat as an array, to allow comparisons with arrays
    isArray: true,
    isList: true,
  }, props, { ctor: 'Arguments' }))
}
exports.describe = describe

function deserialize (state, recursor) {
  return new DeserializedArgumentsValue(state, recursor)
}
exports.deserialize = deserialize

const tag = Symbol('ArgumentsValue')
exports.tag = tag

class ArgumentsValue extends object.ObjectValue {
  compare (expected) {
    if (expected.isComplex !== true) return UNEQUAL

    // When used on the left-hand side of a comparison, argument values may be
    // compared to arrays.
    if (expected.stringTag === 'Array') return AMBIGUOUS

    return super.compare(expected)
  }
}
Object.defineProperty(ArgumentsValue.prototype, 'tag', { value: tag })

const DescribedArgumentsValue = object.DescribedMixin(ArgumentsValue)

class DeserializedArgumentsValue extends object.DeserializedMixin(ArgumentsValue) {
  compare (expected) {
    // Deserialized argument values may only be compared to argument values.
    return expected.isComplex === true && expected.stringTag === 'Array'
      ? UNEQUAL
      : super.compare(expected)
  }
}
