'use strict'

const stringPrimitive = require('../primitiveValues/string').tag
const recursorUtils = require('../recursorUtils')
const object = require('./object')

function describe (props) {
  return new DescribedBoxedValue(props)
}
exports.describe = describe

function deserialize (state, recursor) {
  return new DeserializedBoxedValue(state, recursor)
}
exports.deserialize = deserialize

const tag = Symbol('BoxedValue')
exports.tag = tag

class BoxedValue extends object.ObjectValue {}
Object.defineProperty(BoxedValue.prototype, 'tag', { value: tag })

class DescribedBoxedValue extends object.DescribedMixin(BoxedValue) {
  constructor (props) {
    super(props)
    this.unboxed = props.unboxed
  }

  createListRecursor () {
    return recursorUtils.NOOP_RECURSOR
  }

  createPropertyRecursor () {
    if (this.unboxed.tag !== stringPrimitive) return super.createPropertyRecursor()

    // Just so that createPropertyRecursor() skips the index-based character
    // properties.
    try {
      this.isList = true
      return super.createPropertyRecursor()
    } finally {
      this.isList = false
    }
  }

  createRecursor () {
    return recursorUtils.unshift(super.createRecursor(), this.unboxed)
  }
}

const DeserializedBoxedValue = object.DeserializedMixin(BoxedValue)
