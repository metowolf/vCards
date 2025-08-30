'use strict'

const Circular = require('./Circular')
const Indenter = require('./Indenter')
const constants = require('./constants')
const describe = require('./describe')
const lineBuilder = require('./lineBuilder')
const recursorUtils = require('./recursorUtils')
const shouldCompareDeep = require('./shouldCompareDeep')
const symbolProperties = require('./symbolProperties')
const themeUtils = require('./themeUtils')

const AMBIGUOUS = constants.AMBIGUOUS
const DEEP_EQUAL = constants.DEEP_EQUAL
const UNEQUAL = constants.UNEQUAL
const SHALLOW_EQUAL = constants.SHALLOW_EQUAL
const NOOP = Symbol('NOOP')

const alwaysFormat = () => true

function compareComplexShape (lhs, rhs) {
  let result = lhs.compare(rhs)
  if (result === DEEP_EQUAL) return DEEP_EQUAL
  if (result === UNEQUAL || !shouldCompareDeep(result, lhs, rhs)) return UNEQUAL

  let collectedSymbolProperties = false
  let lhsRecursor = lhs.createRecursor()
  let rhsRecursor = rhs.createRecursor()

  do {
    lhs = lhsRecursor()
    rhs = rhsRecursor()

    if (lhs === null && rhs === null) return SHALLOW_EQUAL
    if (lhs === null || rhs === null) return UNEQUAL

    result = lhs.compare(rhs)
    if (result === UNEQUAL) return UNEQUAL
    if (
      result === AMBIGUOUS &&
      lhs.isProperty === true && !collectedSymbolProperties &&
      shouldCompareDeep(result, lhs, rhs)
    ) {
      collectedSymbolProperties = true
      const lhsCollector = new symbolProperties.Collector(lhs, lhsRecursor)
      const rhsCollector = new symbolProperties.Collector(rhs, rhsRecursor)

      lhsRecursor = recursorUtils.sequence(
        lhsCollector.createRecursor(),
        recursorUtils.unshift(lhsRecursor, lhsCollector.collectAll()))
      rhsRecursor = recursorUtils.sequence(
        rhsCollector.createRecursor(),
        recursorUtils.unshift(rhsRecursor, rhsCollector.collectAll()))
    }
  } while (true)
}

function diffDescriptors (lhs, rhs, options) {
  const theme = themeUtils.normalize(options)
  const invert = options ? options.invert === true : false

  const lhsCircular = new Circular()
  const rhsCircular = new Circular()
  const maxDepth = (options && options.maxDepth) || 0

  let indent = new Indenter(0, '  ')

  const lhsStack = []
  const rhsStack = []
  let topIndex = -1

  const buffer = lineBuilder.buffer()
  const diffStack = []
  let diffIndex = -1

  const isCircular = descriptor => lhsCircular.has(descriptor) || rhsCircular.has(descriptor)

  const format = (builder, subject, circular, depthOffset = 0) => {
    if (diffIndex >= 0 && !diffStack[diffIndex].shouldFormat(subject)) return

    if (circular.has(subject)) {
      diffStack[diffIndex].formatter.append(builder.single(theme.circular))
      return
    }

    const formatStack = []
    let formatIndex = -1

    do {
      if (circular.has(subject)) {
        formatStack[formatIndex].formatter.append(builder.single(theme.circular), subject)
      } else {
        let didFormat = false
        if (typeof subject.formatDeep === 'function') {
          let formatted = subject.formatDeep(themeUtils.applyModifiers(subject, theme), indent)
          if (formatted !== null) {
            didFormat = true

            if (formatIndex === -1) {
              formatted = builder.setDefaultGutter(formatted)
              if (diffIndex === -1) {
                buffer.append(formatted)
              } else {
                diffStack[diffIndex].formatter.append(formatted, subject)
              }
            } else {
              formatStack[formatIndex].formatter.append(formatted, subject)
            }
          }
        }

        if (!didFormat && typeof subject.formatShallow === 'function') {
          const formatter = subject.formatShallow(themeUtils.applyModifiers(subject, theme), indent)
          const recursor = subject.createRecursor()

          if (formatter.increaseIndent && maxDepth > 0 && indent.level === (maxDepth + depthOffset)) {
            const isEmpty = recursor() === null
            let formatted = !isEmpty && typeof formatter.maxDepth === 'function'
              ? formatter.maxDepth()
              : formatter.finalize()

            if (formatIndex === -1) {
              formatted = builder.setDefaultGutter(formatted)
              diffStack[diffIndex].formatter.append(formatted, subject)
            } else {
              formatStack[formatIndex].formatter.append(formatted, subject)
            }
          } else {
            formatStack.push({
              formatter,
              recursor,
              decreaseIndent: formatter.increaseIndent,
              shouldFormat: formatter.shouldFormat || alwaysFormat,
              subject,
            })
            formatIndex++

            if (formatter.increaseIndent) indent = indent.increase()
            circular.add(subject)
          }
        }
      }

      while (formatIndex >= 0) {
        do {
          subject = formatStack[formatIndex].recursor()
        } while (subject && !formatStack[formatIndex].shouldFormat(subject))

        if (subject) {
          break
        }

        const record = formatStack.pop()
        formatIndex--
        if (record.decreaseIndent) indent = indent.decrease()
        circular.delete(record.subject)

        let formatted = record.formatter.finalize()
        if (formatIndex === -1) {
          formatted = builder.setDefaultGutter(formatted)
          if (diffIndex === -1) {
            buffer.append(formatted)
          } else {
            diffStack[diffIndex].formatter.append(formatted, record.subject)
          }
        } else {
          formatStack[formatIndex].formatter.append(formatted, record.subject)
        }
      }
    } while (formatIndex >= 0)
  }

  do {
    let compareResult = NOOP
    if (lhsCircular.has(lhs)) {
      compareResult = lhsCircular.get(lhs) === rhsCircular.get(rhs)
        ? DEEP_EQUAL
        : UNEQUAL
    } else if (rhsCircular.has(rhs)) {
      compareResult = UNEQUAL
    }

    let firstPassSymbolProperty = false
    if (lhs.isProperty === true) {
      compareResult = lhs.compare(rhs)
      if (compareResult === AMBIGUOUS) {
        const parent = lhsStack[topIndex].subject
        firstPassSymbolProperty = parent.isSymbolPropertiesCollector !== true && parent.isSymbolPropertiesComparable !== true
      }
    }

    let didFormat = false
    let mustRecurse = false
    if (compareResult !== DEEP_EQUAL && !firstPassSymbolProperty && typeof lhs.prepareDiff === 'function') {
      const lhsRecursor = topIndex === -1 ? null : lhsStack[topIndex].recursor
      const rhsRecursor = topIndex === -1 ? null : rhsStack[topIndex].recursor

      const instructions = lhs.prepareDiff(
        rhs,
        lhsRecursor,
        rhsRecursor,
        compareComplexShape,
        isCircular)

      if (instructions !== null) {
        if (topIndex >= 0) {
          if (typeof instructions.lhsRecursor === 'function') {
            lhsStack[topIndex].recursor = instructions.lhsRecursor
          }
          if (typeof instructions.rhsRecursor === 'function') {
            rhsStack[topIndex].recursor = instructions.rhsRecursor
          }
        }

        if (instructions.compareResult) {
          compareResult = instructions.compareResult
        }
        if (instructions.mustRecurse === true) {
          mustRecurse = true
        } else {
          if (instructions.actualIsExtraneous === true) {
            format(lineBuilder.actual, lhs, lhsCircular)
            didFormat = true
          } else if (instructions.multipleAreExtraneous === true) {
            for (const extraneous of instructions.descriptors) {
              format(lineBuilder.actual, extraneous, lhsCircular)
            }
            didFormat = true
          } else if (instructions.expectedIsMissing === true) {
            format(lineBuilder.expected, rhs, rhsCircular)
            didFormat = true
          } else if (instructions.multipleAreMissing === true) {
            for (const missing of instructions.descriptors) {
              format(lineBuilder.expected, missing, rhsCircular)
            }
            didFormat = true
          } else if (instructions.isUnequal === true) {
            format(lineBuilder.actual, lhs, lhsCircular)
            format(lineBuilder.expected, rhs, rhsCircular)
            didFormat = true
          } else if (!instructions.compareResult) {
            // TODO: Throw a useful, custom error
            throw new Error('Illegal result of prepareDiff()')
          }
        }
      }
    }

    if (!didFormat) {
      if (compareResult === NOOP) {
        compareResult = lhs.compare(rhs)
      }

      if (!mustRecurse) {
        mustRecurse = shouldCompareDeep(compareResult, lhs, rhs)
      }

      if (compareResult === DEEP_EQUAL) {
        format(lineBuilder, lhs, lhsCircular)
      } else if (mustRecurse) {
        if (compareResult === AMBIGUOUS && lhs.isProperty === true) {
          // Replace both sides by a pseudo-descriptor which collects symbol
          // properties instead.
          lhs = new symbolProperties.Collector(lhs, lhsStack[topIndex].recursor)
          rhs = new symbolProperties.Collector(rhs, rhsStack[topIndex].recursor)
          // Replace the current recursors so they can continue correctly after
          // the collectors have been "compared". This is necessary since the
          // collectors eat the first value after the last symbol property.
          lhsStack[topIndex].recursor = recursorUtils.unshift(lhsStack[topIndex].recursor, lhs.collectAll())
          rhsStack[topIndex].recursor = recursorUtils.unshift(rhsStack[topIndex].recursor, rhs.collectAll())
        }

        if (typeof lhs.diffShallow === 'function') {
          const formatter = lhs.diffShallow(rhs, themeUtils.applyModifiers(lhs, theme), indent)
          diffStack.push({
            formatter,
            origin: lhs,
            decreaseIndent: formatter.increaseIndent,
            exceedsMaxDepth: formatter.increaseIndent && maxDepth > 0 && indent.level >= maxDepth,
            shouldFormat: formatter.shouldFormat || alwaysFormat,
          })
          diffIndex++

          if (formatter.increaseIndent) indent = indent.increase()
        } else if (typeof lhs.formatShallow === 'function') {
          const formatter = lhs.formatShallow(themeUtils.applyModifiers(lhs, theme), indent)
          diffStack.push({
            formatter,
            decreaseIndent: formatter.increaseIndent,
            exceedsMaxDepth: formatter.increaseIndent && maxDepth > 0 && indent.level >= maxDepth,
            shouldFormat: formatter.shouldFormat || alwaysFormat,
            subject: lhs,
          })
          diffIndex++

          if (formatter.increaseIndent) indent = indent.increase()
        }

        lhsCircular.add(lhs)
        rhsCircular.add(rhs)

        lhsStack.push({ diffIndex, subject: lhs, recursor: lhs.createRecursor() })
        rhsStack.push({ diffIndex, subject: rhs, recursor: rhs.createRecursor() })
        topIndex++
      } else {
        const diffed = typeof lhs.diffDeep === 'function'
          ? lhs.diffDeep(rhs, themeUtils.applyModifiers(lhs, theme), indent, invert)
          : null

        if (diffed === null) {
          format(lineBuilder.actual, lhs, lhsCircular)
          format(lineBuilder.expected, rhs, rhsCircular)
        } else {
          if (diffIndex === -1) {
            buffer.append(diffed)
          } else {
            diffStack[diffIndex].formatter.append(diffed, lhs)
          }
        }
      }
    }

    while (topIndex >= 0) {
      lhs = lhsStack[topIndex].recursor()
      rhs = rhsStack[topIndex].recursor()

      if (lhs !== null && rhs !== null) {
        break
      }

      if (lhs === null && rhs === null) {
        const lhsRecord = lhsStack.pop()
        const rhsRecord = rhsStack.pop()
        lhsCircular.delete(lhsRecord.subject)
        rhsCircular.delete(rhsRecord.subject)
        topIndex--

        if (lhsRecord.diffIndex === diffIndex) {
          const record = diffStack.pop()
          diffIndex--
          if (record.decreaseIndent) indent = indent.decrease()

          let formatted = record.formatter.finalize()
          if (record.exceedsMaxDepth && !formatted.hasGutter) {
            // The record exceeds the max depth, but contains no actual diff.
            // Discard the potentially deep formatting and format just the
            // original subject.
            const subject = lhsRecord.subject
            const formatter = subject.formatShallow(themeUtils.applyModifiers(subject, theme), indent)
            const isEmpty = subject.createRecursor()() === null
            formatted = !isEmpty && typeof formatter.maxDepth === 'function'
              ? formatter.maxDepth()
              : formatter.finalize()
          }

          if (diffIndex === -1) {
            buffer.append(formatted)
          } else {
            diffStack[diffIndex].formatter.append(formatted, record.subject)
          }
        }
      } else {
        let builder, circular, stack, subject
        if (lhs === null) {
          builder = lineBuilder.expected
          circular = rhsCircular
          stack = rhsStack
          subject = rhs
        } else {
          builder = lineBuilder.actual
          circular = lhsCircular
          stack = lhsStack
          subject = lhs
        }

        do {
          format(builder, subject, circular, indent.level)
          subject = stack[topIndex].recursor()
        } while (subject !== null)
      }
    }
  } while (topIndex >= 0)

  return buffer.toString({ diff: true, invert, theme })
}
exports.diffDescriptors = diffDescriptors

function diff (actual, expected, options) {
  return diffDescriptors(describe(actual, options), describe(expected, options), options)
}
exports.diff = diff
