'use strict'

const stringEscape = require('js-string-escape')
const wellKnownSymbols = require('well-known-symbols')

const constants = require('../constants')
const formatUtils = require('../formatUtils')
const lineBuilder = require('../lineBuilder')

const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL

function describe (value) {
  let stringCompare = null

  const key = Symbol.keyFor(value)
  if (key !== undefined) {
    stringCompare = `Symbol.for(${stringEscape(key)})`
  } else if (wellKnownSymbols.isWellKnown(value)) {
    stringCompare = wellKnownSymbols.getLabel(value)
  }

  return new SymbolValue({
    stringCompare,
    value,
  })
}
exports.describe = describe

function deserialize (state) {
  const stringCompare = state[0]
  const string = state[1] || state[0]

  return new DeserializedSymbolValue({
    string,
    stringCompare,
    value: null,
  })
}
exports.deserialize = deserialize

const tag = Symbol('SymbolValue')
exports.tag = tag

class SymbolValue {
  constructor (props) {
    this.stringCompare = props.stringCompare
    this.value = props.value
  }

  compare (expected) {
    if (expected.tag !== tag) return UNEQUAL

    if (this.stringCompare !== null) {
      return this.stringCompare === expected.stringCompare
        ? DEEP_EQUAL
        : UNEQUAL
    }

    return this.value === expected.value
      ? DEEP_EQUAL
      : UNEQUAL
  }

  formatString () {
    if (this.stringCompare !== null) return this.stringCompare
    return stringEscape(this.value.toString())
  }

  formatDeep (theme) {
    return lineBuilder.single(formatUtils.wrap(theme.symbol, this.formatString()))
  }

  formatAsKey (theme) {
    return formatUtils.wrap(theme.property.keyBracket, formatUtils.wrap(theme.symbol, this.formatString()))
  }

  serialize () {
    const string = this.formatString()
    return this.stringCompare === string
      ? [this.stringCompare]
      : [this.stringCompare, string]
  }
}
Object.defineProperty(SymbolValue.prototype, 'isPrimitive', { value: true })
Object.defineProperty(SymbolValue.prototype, 'tag', { value: tag })

class DeserializedSymbolValue extends SymbolValue {
  constructor (props) {
    super(props)
    this.string = props.string
  }

  compare (expected) {
    if (expected.tag !== tag) return UNEQUAL

    if (this.stringCompare !== null) {
      return this.stringCompare === expected.stringCompare
        ? DEEP_EQUAL
        : UNEQUAL
    }

    // Symbols that are not in the global symbol registry, and are not
    // well-known, cannot be compared when deserialized. Treat symbols
    // as equal if they are formatted the same.
    return this.string === expected.formatString()
      ? DEEP_EQUAL
      : UNEQUAL
  }

  formatString () {
    return this.string
  }
}
