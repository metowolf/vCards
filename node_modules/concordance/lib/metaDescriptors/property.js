'use strict'

const constants = require('../constants')
const formatUtils = require('../formatUtils')
const symbolPrimitive = require('../primitiveValues/symbol').tag
const recursorUtils = require('../recursorUtils')

const AMBIGUOUS = constants.AMBIGUOUS
const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL

function describeComplex (key, value) {
  return new ComplexProperty(key, value)
}
exports.describeComplex = describeComplex

function deserializeComplex (key, recursor) {
  const value = recursor()
  return new ComplexProperty(key, value)
}
exports.deserializeComplex = deserializeComplex

function describePrimitive (key, value) {
  return new PrimitiveProperty(key, value)
}
exports.describePrimitive = describePrimitive

function deserializePrimitive (state) {
  const key = state[0]
  const value = state[1]
  return new PrimitiveProperty(key, value)
}
exports.deserializePrimitive = deserializePrimitive

const complexTag = Symbol('ComplexProperty')
exports.complexTag = complexTag

const primitiveTag = Symbol('PrimitiveProperty')
exports.primitiveTag = primitiveTag

class Property {
  constructor (key) {
    this.key = key
  }

  compareKeys (expected) {
    const result = this.key.compare(expected.key)
    // Return AMBIGUOUS if symbol keys are unequal. It's likely that properties
    // are compared in order of declaration, which is not the desired strategy.
    // Returning AMBIGUOUS allows compare() and diff() to recognize this
    // situation and sort the symbol properties before comparing them.
    return result === UNEQUAL && this.key.tag === symbolPrimitive && expected.key.tag === symbolPrimitive
      ? AMBIGUOUS
      : result
  }

  prepareDiff (expected, lhsRecursor, rhsRecursor, compareComplexShape, isCircular) {
    // Circular values cannot be compared. They must be treated as being unequal when diffing.
    if (isCircular(this.value) || isCircular(expected.value)) return { compareResult: UNEQUAL }

    // Try to line up this or remaining properties with the expected properties.
    const rhsFork = recursorUtils.fork(rhsRecursor)
    const initialExpected = expected

    do {
      if (expected === null || expected.isProperty !== true) {
        return {
          actualIsExtraneous: true,
          rhsRecursor: recursorUtils.unshift(rhsFork.recursor, initialExpected),
        }
      } else if (this.key.compare(expected.key) === DEEP_EQUAL) {
        if (expected === initialExpected) {
          return null
        } else {
          return {
            expectedIsMissing: true,
            lhsRecursor: recursorUtils.unshift(lhsRecursor, this),
            rhsRecursor: rhsFork.recursor,
          }
        }
      }

      expected = rhsFork.shared()
    } while (true)
  }
}
Object.defineProperty(Property.prototype, 'isProperty', { value: true })

class ComplexProperty extends Property {
  constructor (key, value) {
    super(key)
    this.value = value
  }

  createRecursor () {
    return recursorUtils.singleValue(this.value)
  }

  compare (expected) {
    if (expected.isProperty !== true) return UNEQUAL

    const keyResult = this.compareKeys(expected)
    if (keyResult !== DEEP_EQUAL) return keyResult

    return this.tag === expected.tag
      ? this.value.compare(expected.value)
      : UNEQUAL
  }

  formatShallow (theme, indent) {
    const increaseValueIndent = theme.property.increaseValueIndent === true
    return new formatUtils.SingleValueFormatter(theme, value => {
      if (typeof theme.property.customFormat === 'function') {
        return theme.property.customFormat(theme, indent, this.key, value)
      }

      return value
        .withFirstPrefixed(this.key.formatAsKey(theme) + theme.property.separator)
        .withLastPostfixed(theme.property.after)
    }, increaseValueIndent)
  }

  serialize () {
    return this.key
  }
}
Object.defineProperty(ComplexProperty.prototype, 'tag', { value: complexTag })

class PrimitiveProperty extends Property {
  constructor (key, value) {
    super(key)
    this.value = value
  }

  compare (expected) {
    if (expected.isProperty !== true) return UNEQUAL

    const keyResult = this.compareKeys(expected)
    if (keyResult !== DEEP_EQUAL) return keyResult

    return this.tag !== expected.tag
      ? UNEQUAL
      : this.value.compare(expected.value)
  }

  formatDeep (theme, indent) {
    const increaseValueIndent = theme.property.increaseValueIndent === true
    const valueIndent = increaseValueIndent ? indent.increase() : indent

    // Since the key and value are formatted directly, modifiers are not
    // applied. Apply modifiers to the property descriptor instead.
    const formatted = this.value.formatDeep(theme, valueIndent)

    if (typeof theme.property.customFormat === 'function') {
      return theme.property.customFormat(theme, indent, this.key, formatted)
    }

    return formatted
      .withFirstPrefixed(this.key.formatAsKey(theme) + theme.property.separator)
      .withLastPostfixed(theme.property.after)
  }

  diffDeep (expected, theme, indent, invert) {
    // Verify a diff can be returned.
    if (this.tag !== expected.tag || typeof this.value.diffDeep !== 'function') return null
    // Only use this logic to diff values when the keys are the same.
    if (this.key.compare(expected.key) !== DEEP_EQUAL) return null

    const increaseValueIndent = theme.property.increaseValueIndent === true
    const valueIndent = increaseValueIndent ? indent.increase() : indent

    // Since the key and value are diffed directly, modifiers are not
    // applied. Apply modifiers to the property descriptor instead.
    const diff = this.value.diffDeep(expected.value, theme, valueIndent, invert)
    if (diff === null) return null

    if (typeof theme.property.customFormat === 'function') {
      return theme.property.customFormat(theme, indent, this.key, diff)
    }

    return diff
      .withFirstPrefixed(this.key.formatAsKey(theme) + theme.property.separator)
      .withLastPostfixed(theme.property.after)
  }

  serialize () {
    return [this.key, this.value]
  }
}
Object.defineProperty(PrimitiveProperty.prototype, 'tag', { value: primitiveTag })
