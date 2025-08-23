'use strict'

const constants = require('../constants')
const recursorUtils = require('../recursorUtils')
const object = require('./object')

const SHALLOW_EQUAL = constants.SHALLOW_EQUAL
const UNEQUAL = constants.UNEQUAL

function describe (props) {
  return new DescribedSetValue(Object.assign({
    size: props.value.size,
  }, props))
}
exports.describe = describe

function deserialize (state, recursor) {
  return new DeserializedSetValue(state, recursor)
}
exports.deserialize = deserialize

const tag = Symbol('SetValue')
exports.tag = tag

class SetValue extends object.ObjectValue {
  constructor (props) {
    super(props)
    this.size = props.size
  }

  compare (expected) {
    const result = super.compare(expected)
    if (result !== SHALLOW_EQUAL) return result

    return this.size === expected.size
      ? SHALLOW_EQUAL
      : UNEQUAL
  }

  prepareDiff (expected) {
    // Sets should be compared, even if they have a different number of items.
    return { compareResult: super.compare(expected) }
  }

  serialize () {
    return [this.size, super.serialize()]
  }
}
Object.defineProperty(SetValue.prototype, 'tag', { value: tag })

class DescribedSetValue extends object.DescribedMixin(SetValue) {
  createIterableRecursor () {
    const size = this.size
    if (size === 0) return recursorUtils.NOOP_RECURSOR

    let index = 0
    let members
    const next = () => {
      if (index === size) return null

      if (!members) {
        members = Array.from(this.value)
      }

      const value = members[index]
      return this.describeItem(index++, this.describeAny(value))
    }

    return { size, next }
  }
}

class DeserializedSetValue extends object.DeserializedMixin(SetValue) {
  constructor (state, recursor) {
    super(state[1], recursor)
    this.size = state[0]
  }
}
