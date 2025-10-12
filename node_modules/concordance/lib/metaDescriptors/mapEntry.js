'use strict'

const constants = require('../constants')
const lineBuilder = require('../lineBuilder')
const recursorUtils = require('../recursorUtils')
const themeUtils = require('../themeUtils')

const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL
const SHALLOW_EQUAL = constants.SHALLOW_EQUAL

function describe (keyDescriptor, valueDescriptor) {
  const keyIsPrimitive = keyDescriptor.isPrimitive === true
  const valueIsPrimitive = valueDescriptor.isPrimitive === true

  return new MapEntry(keyDescriptor, valueDescriptor, keyIsPrimitive, valueIsPrimitive)
}
exports.describe = describe

function deserialize (state, recursor) {
  const keyIsPrimitive = state[0]
  const valueIsPrimitive = state[1]
  const keyDescriptor = recursor()
  const valueDescriptor = recursor()

  return new MapEntry(keyDescriptor, valueDescriptor, keyIsPrimitive, valueIsPrimitive)
}
exports.deserialize = deserialize

const tag = Symbol('MapEntry')
exports.tag = tag

function mergeWithKey (theme, key, values) {
  const lines = lineBuilder.buffer()
  const keyRemainder = lineBuilder.buffer()
  for (const line of key) {
    if (!line.isLast && !line.hasGutter) {
      lines.append(line)
    } else {
      keyRemainder.append(line)
    }
  }
  for (const value of values) {
    lines.append(keyRemainder.mergeWithInfix(theme.mapEntry.separator, value).withLastPostfixed(theme.mapEntry.after))
  }
  return lines
}

class MapEntry {
  constructor (key, value, keyIsPrimitive, valueIsPrimitive) {
    this.key = key
    this.value = value
    this.keyIsPrimitive = keyIsPrimitive
    this.valueIsPrimitive = valueIsPrimitive
  }

  createRecursor () {
    let emitKey = true
    let emitValue = true

    return () => {
      if (emitKey) {
        emitKey = false
        return this.key
      }

      if (emitValue) {
        emitValue = false
        return this.value
      }

      return null
    }
  }

  compare (expected) {
    if (this.tag !== expected.tag) return UNEQUAL
    if (this.keyIsPrimitive !== expected.keyIsPrimitive) return UNEQUAL
    if (this.valueIsPrimitive !== expected.valueIsPrimitive) return UNEQUAL

    if (!this.keyIsPrimitive) return SHALLOW_EQUAL

    const keyResult = this.key.compare(expected.key)
    if (keyResult !== DEEP_EQUAL) return keyResult

    if (!this.valueIsPrimitive) return SHALLOW_EQUAL
    return this.value.compare(expected.value)
  }

  formatDeep (theme, indent) {
    // Verify the map entry can be formatted directly.
    if (!this.keyIsPrimitive || typeof this.value.formatDeep !== 'function') return null

    // Since formatShallow() would result in theme modifiers being applied
    // before the key and value are formatted, do the same here.
    const value = this.value.formatDeep(themeUtils.applyModifiersToOriginal(this.value, theme), indent)
    if (value === null) return null

    const key = this.key.formatDeep(themeUtils.applyModifiersToOriginal(this.key, theme), indent)
    return mergeWithKey(theme, key, [value])
  }

  formatShallow (theme, indent) {
    let key = null
    const values = []
    return {
      append: (formatted, origin) => {
        if (this.key === origin) {
          key = formatted
        } else {
          values.push(formatted)
        }
      },
      finalize () {
        return mergeWithKey(theme, key, values)
      },
    }
  }

  diffDeep (expected, theme, indent, invert) {
    // Verify a diff can be returned.
    if (this.tag !== expected.tag || typeof this.value.diffDeep !== 'function') return null
    // Only use this logic to format value diffs when the keys are primitive and equal.
    if (!this.keyIsPrimitive || !expected.keyIsPrimitive || this.key.compare(expected.key) !== DEEP_EQUAL) {
      return null
    }

    // Since formatShallow() would result in theme modifiers being applied
    // before the key and value are formatted, do the same here.
    const diff = this.value.diffDeep(expected.value, themeUtils.applyModifiersToOriginal(this.value, theme), indent, invert)
    if (diff === null) return null

    const key = this.key.formatDeep(themeUtils.applyModifiersToOriginal(this.key, theme), indent, '')
    return mergeWithKey(theme, key, [diff])
  }

  prepareDiff (expected, lhsRecursor, rhsRecursor, compareComplexShape, isCircular) {
    // Circular values cannot be compared. They must be treated as being unequal when diffing.
    if (isCircular(this.value) || isCircular(expected.value)) return { compareResult: UNEQUAL }

    const compareResult = this.compare(expected)
    const keysAreEqual = this.tag === expected.tag && this.key.compare(expected.key) === DEEP_EQUAL
    // Short-circuit when keys and/or values are deeply equal.
    if (compareResult === DEEP_EQUAL || keysAreEqual) return { compareResult }

    // Try to line up this or remaining map entries with the expected entries.
    const lhsFork = recursorUtils.fork(lhsRecursor)
    const rhsFork = recursorUtils.fork(rhsRecursor)
    const initialExpected = expected

    let expectedIsMissing = false
    while (!expectedIsMissing && expected !== null && this.tag === expected.tag) {
      if (expected.keyIsPrimitive) {
        expectedIsMissing = this.key.compare(expected.key) !== UNEQUAL
      } else {
        expectedIsMissing = compareComplexShape(this.key, expected.key) !== UNEQUAL
      }

      expected = rhsFork.shared()
    }

    let actualIsExtraneous = false
    if (this.tag === initialExpected.tag) {
      if (initialExpected.keyIsPrimitive) {
        let actual = this
        while (!actualIsExtraneous && actual !== null && this.tag === actual.tag) {
          if (actual.keyIsPrimitive) {
            actualIsExtraneous = initialExpected.key.compare(actual.key) === DEEP_EQUAL
          }

          actual = lhsFork.shared()
        }
      } else {
        let actual = this
        while (!actualIsExtraneous && actual !== null && this.tag === actual.tag) {
          if (!actual.keyIsPrimitive) {
            actualIsExtraneous = compareComplexShape(actual.key, initialExpected.key) !== UNEQUAL
          }

          actual = lhsFork.shared()
        }
      }
    }

    if (actualIsExtraneous && !expectedIsMissing) {
      return {
        actualIsExtraneous: true,
        lhsRecursor: lhsFork.recursor,
        rhsRecursor: recursorUtils.unshift(rhsFork.recursor, initialExpected),
      }
    }

    if (expectedIsMissing && !actualIsExtraneous) {
      return {
        expectedIsMissing: true,
        lhsRecursor: recursorUtils.unshift(lhsFork.recursor, this),
        rhsRecursor: rhsFork.recursor,
      }
    }

    let mustRecurse = false
    if (!this.keyIsPrimitive && !initialExpected.keyIsPrimitive) {
      if (this.valueIsPrimitive || initialExpected.valueIsPrimitive) {
        mustRecurse = this.value.compare(initialExpected.value) !== UNEQUAL
      } else {
        mustRecurse = compareComplexShape(this.value, initialExpected.value) !== UNEQUAL
      }
    }

    return {
      mustRecurse,
      isUnequal: !mustRecurse,
      lhsRecursor: lhsFork.recursor,
      rhsRecursor: rhsFork.recursor,
    }
  }

  serialize () {
    return [this.keyIsPrimitive, this.valueIsPrimitive]
  }
}
Object.defineProperty(MapEntry.prototype, 'isMapEntry', { value: true })
Object.defineProperty(MapEntry.prototype, 'tag', { value: tag })
