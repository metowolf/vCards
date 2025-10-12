'use strict'

const constants = require('../constants')
const formatUtils = require('../formatUtils')
const lineBuilder = require('../lineBuilder')

const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL

function describe (value) {
  return new BooleanValue(value)
}
exports.describe = describe

exports.deserialize = describe

const tag = Symbol('BooleanValue')
exports.tag = tag

class BooleanValue {
  constructor (value) {
    this.value = value
  }

  compare (expected) {
    return this.tag === expected.tag && this.value === expected.value
      ? DEEP_EQUAL
      : UNEQUAL
  }

  formatDeep (theme) {
    return lineBuilder.single(formatUtils.wrap(theme.boolean, this.value === true ? 'true' : 'false'))
  }

  serialize () {
    return this.value
  }
}
Object.defineProperty(BooleanValue.prototype, 'isPrimitive', { value: true })
Object.defineProperty(BooleanValue.prototype, 'tag', { value: tag })
