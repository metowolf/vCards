'use strict'

const constants = require('../constants')
const formatUtils = require('../formatUtils')
const lineBuilder = require('../lineBuilder')

const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL

function describe (value) {
  return new BigIntValue(value)
}
exports.describe = describe

exports.deserialize = describe

const tag = Symbol('BigIntValue')
exports.tag = tag

class BigIntValue {
  constructor (value) {
    this.value = value
  }

  compare (expected) {
    return expected.tag === tag && Object.is(this.value, expected.value)
      ? DEEP_EQUAL
      : UNEQUAL
  }

  formatDeep (theme) {
    return lineBuilder.single(formatUtils.wrap(theme.bigInt, `${this.value}n`))
  }

  serialize () {
    return this.value
  }
}
Object.defineProperty(BigIntValue.prototype, 'isPrimitive', { value: true })
Object.defineProperty(BigIntValue.prototype, 'tag', { value: tag })
