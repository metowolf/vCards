'use strict'

const constants = require('../constants')
const formatUtils = require('../formatUtils')
const lineBuilder = require('../lineBuilder')

const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL

function describe () {
  return new NullValue()
}
exports.describe = describe

exports.deserialize = describe

const tag = Symbol('NullValue')
exports.tag = tag

class NullValue {
  compare (expected) {
    return expected.tag === tag
      ? DEEP_EQUAL
      : UNEQUAL
  }

  formatDeep (theme) {
    return lineBuilder.single(formatUtils.wrap(theme.null, 'null'))
  }
}
Object.defineProperty(NullValue.prototype, 'isPrimitive', { value: true })
Object.defineProperty(NullValue.prototype, 'tag', { value: tag })
