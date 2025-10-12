'use strict'

const constants = require('../constants')
const recursorUtils = require('../recursorUtils')
const object = require('./object')

const SHALLOW_EQUAL = constants.SHALLOW_EQUAL
const UNEQUAL = constants.UNEQUAL

function describe (props) {
  return new DescribedMapValue(Object.assign({
    size: props.value.size,
  }, props))
}
exports.describe = describe

function deserialize (state, recursor) {
  return new DeserializedMapValue(state, recursor)
}
exports.deserialize = deserialize

const tag = Symbol('MapValue')
exports.tag = tag

class MapValue extends object.ObjectValue {
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
    // Maps should be compared, even if they have a different number of entries.
    return { compareResult: super.compare(expected) }
  }

  serialize () {
    return [this.size, super.serialize()]
  }
}
Object.defineProperty(MapValue.prototype, 'tag', { value: tag })

class DescribedMapValue extends object.DescribedMixin(MapValue) {
  createIterableRecursor () {
    const size = this.size
    if (size === 0) return recursorUtils.NOOP_RECURSOR

    let index = 0
    let entries
    const next = () => {
      if (index === size) return null

      if (!entries) {
        entries = Array.from(this.value)
      }

      const entry = entries[index++]
      return this.describeMapEntry(this.describeAny(entry[0]), this.describeAny(entry[1]))
    }

    return { size, next }
  }
}

class DeserializedMapValue extends object.DeserializedMixin(MapValue) {
  constructor (state, recursor) {
    super(state[1], recursor)
    this.size = state[0]
  }
}
