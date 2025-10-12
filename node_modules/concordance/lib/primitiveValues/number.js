'use strict'

const constants = require('../constants')
const formatUtils = require('../formatUtils')
const lineBuilder = require('../lineBuilder')

const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL

function describe (value) {
  return new NumberValue(value)
}
exports.describe = describe

exports.deserialize = describe

const tag = Symbol('NumberValue')
exports.tag = tag

class NumberValue {
  constructor (value) {
    this.value = value
  }

  compare (expected) {
    return expected.tag === tag && Object.is(this.value, expected.value)
      ? DEEP_EQUAL
      : UNEQUAL
  }

  formatDeep (theme) {
    const string = Object.is(this.value, -0) ? '-0' : String(this.value)
    return lineBuilder.single(formatUtils.wrap(theme.number, string))
  }

  serialize () {
    return this.value
  }
}
Object.defineProperty(NumberValue.prototype, 'isPrimitive', { value: true })
Object.defineProperty(NumberValue.prototype, 'tag', { value: tag })
