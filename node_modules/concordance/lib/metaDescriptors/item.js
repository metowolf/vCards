'use strict'

const constants = require('../constants')
const formatUtils = require('../formatUtils')
const recursorUtils = require('../recursorUtils')

const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL

function describeComplex (index, value) {
  return new ComplexItem(index, value)
}
exports.describeComplex = describeComplex

function deserializeComplex (index, recursor) {
  const value = recursor()
  return new ComplexItem(index, value)
}
exports.deserializeComplex = deserializeComplex

function describePrimitive (index, value) {
  return new PrimitiveItem(index, value)
}
exports.describePrimitive = describePrimitive

function deserializePrimitive (state) {
  const index = state[0]
  const value = state[1]
  return new PrimitiveItem(index, value)
}
exports.deserializePrimitive = deserializePrimitive

const complexTag = Symbol('ComplexItem')
exports.complexTag = complexTag

const primitiveTag = Symbol('PrimitiveItem')
exports.primitiveTag = primitiveTag

class ComplexItem {
  constructor (index, value) {
    this.index = index
    this.value = value
  }

  createRecursor () {
    return recursorUtils.singleValue(this.value)
  }

  compare (expected) {
    return expected.tag === complexTag && this.index === expected.index
      ? this.value.compare(expected.value)
      : UNEQUAL
  }

  formatShallow (theme, indent) {
    const increaseValueIndent = theme.item.increaseValueIndent === true
    return new formatUtils.SingleValueFormatter(theme, value => {
      if (typeof theme.item.customFormat === 'function') {
        return theme.item.customFormat(theme, indent, value)
      }

      return value.withLastPostfixed(theme.item.after)
    }, increaseValueIndent)
  }

  prepareDiff (expected, lhsRecursor, rhsRecursor, compareComplexShape, isCircular) {
    // Circular values cannot be compared. They must be treated as being unequal when diffing.
    if (isCircular(this.value) || isCircular(expected.value)) return { compareResult: UNEQUAL }

    // Try to line up this or remaining items with the expected items.
    const lhsFork = recursorUtils.fork(lhsRecursor)
    const rhsFork = recursorUtils.fork(rhsRecursor)
    const initialExpected = expected

    let expectedIsMissing = false
    while (!expectedIsMissing && expected !== null && expected.isItem === true) {
      if (expected.tag === complexTag) {
        expectedIsMissing = compareComplexShape(this.value, expected.value) !== UNEQUAL
      }

      expected = rhsFork.shared()
    }

    let actualIsExtraneous = false
    if (initialExpected.tag === complexTag) {
      let actual = this
      while (!actualIsExtraneous && actual !== null && actual.isItem === true) {
        if (actual.tag === complexTag) {
          actualIsExtraneous = compareComplexShape(actual.value, initialExpected.value) !== UNEQUAL
        }

        actual = lhsFork.shared()
      }
    } else if (initialExpected.tag === primitiveTag) {
      let actual = this
      while (!actualIsExtraneous && actual !== null && actual.isItem === true) {
        if (actual.tag === primitiveTag) {
          actualIsExtraneous = initialExpected.value.compare(actual.value) === DEEP_EQUAL
        }

        actual = lhsFork.shared()
      }
    }

    if (actualIsExtraneous && !expectedIsMissing) {
      return {
        actualIsExtraneous: true,
        lhsRecursor: lhsFork.recursor,
        rhsRecursor: recursorUtils.map(
          recursorUtils.unshift(rhsFork.recursor, initialExpected),
          next => {
            if (next.isItem !== true) return next

            next.index++
            return next
          }),
      }
    }

    if (expectedIsMissing && !actualIsExtraneous) {
      return {
        expectedIsMissing: true,
        lhsRecursor: recursorUtils.map(
          recursorUtils.unshift(lhsFork.recursor, this),
          next => {
            if (next.isItem !== true) return next

            next.index++
            return next
          }),
        rhsRecursor: rhsFork.recursor,
      }
    }

    const mustRecurse = this.tag === complexTag && initialExpected.tag === complexTag &&
      this.value.compare(initialExpected.value) !== UNEQUAL
    return {
      mustRecurse,
      isUnequal: !mustRecurse,
      lhsRecursor: lhsFork.recursor,
      rhsRecursor: rhsFork.recursor,
    }
  }

  serialize () {
    return this.index
  }
}
Object.defineProperty(ComplexItem.prototype, 'isItem', { value: true })
Object.defineProperty(ComplexItem.prototype, 'tag', { value: complexTag })

class PrimitiveItem {
  constructor (index, value) {
    this.index = index
    this.value = value
  }

  compare (expected) {
    return expected.tag === primitiveTag && this.index === expected.index
      ? this.value.compare(expected.value)
      : UNEQUAL
  }

  formatDeep (theme, indent) {
    const increaseValueIndent = theme.item.increaseValueIndent === true
    const valueIndent = increaseValueIndent ? indent.increase() : indent

    // Since the value is formatted directly, modifiers are not applied. Apply
    // modifiers to the item descriptor instead.
    const formatted = this.value.formatDeep(theme, valueIndent)

    if (typeof theme.item.customFormat === 'function') {
      return theme.item.customFormat(theme, indent, formatted)
    }

    return formatted.withLastPostfixed(theme.item.after)
  }

  prepareDiff (expected, lhsRecursor, rhsRecursor, compareComplexShape, isCircular) {
    const compareResult = this.compare(expected)
    // Short-circuit when values are deeply equal.
    if (compareResult === DEEP_EQUAL) return { compareResult }

    // Short-circut when values can be diffed directly.
    if (
      expected.tag === primitiveTag &&
      this.value.tag === expected.value.tag && typeof this.value.diffDeep === 'function'
    ) {
      return { compareResult }
    }

    // Try to line up this or remaining items with the expected items.
    const rhsFork = recursorUtils.fork(rhsRecursor)
    const initialExpected = expected

    do {
      if (expected === null || expected.isItem !== true) {
        return {
          actualIsExtraneous: true,
          rhsRecursor: recursorUtils.map(
            recursorUtils.unshift(rhsFork.recursor, initialExpected),
            next => {
              if (next.isItem !== true) return next

              next.index++
              return next
            }),
        }
      }

      if (this.value.compare(expected.value) === DEEP_EQUAL) {
        return {
          expectedIsMissing: true,
          lhsRecursor: recursorUtils.map(
            recursorUtils.unshift(lhsRecursor, this),
            next => {
              if (next.isItem !== true) return next

              next.index++
              return next
            }),
          rhsRecursor: rhsFork.recursor,
        }
      }

      expected = rhsFork.shared()
    } while (true)
  }

  diffDeep (expected, theme, indent, invert) {
    // Verify a diff can be returned.
    if (this.tag !== expected.tag || typeof this.value.diffDeep !== 'function') return null

    const increaseValueIndent = theme.property.increaseValueIndent === true
    const valueIndent = increaseValueIndent ? indent.increase() : indent

    // Since the value is diffed directly, modifiers are not applied. Apply
    // modifiers to the item descriptor instead.
    const diff = this.value.diffDeep(expected.value, theme, valueIndent, invert)
    if (diff === null) return null

    if (typeof theme.item.customFormat === 'function') {
      return theme.item.customFormat(theme, indent, diff)
    }

    return diff.withLastPostfixed(theme.item.after)
  }

  serialize () {
    return [this.index, this.value]
  }
}
Object.defineProperty(PrimitiveItem.prototype, 'isItem', { value: true })
Object.defineProperty(PrimitiveItem.prototype, 'tag', { value: primitiveTag })
