'use strict'

const lineBuilder = require('./lineBuilder')

function wrap (fromTheme, value) {
  return fromTheme.open + value + fromTheme.close
}
exports.wrap = wrap

function formatCtorAndStringTag (theme, object) {
  if (!object.ctor) return wrap(theme.object.stringTag, object.stringTag)

  let retval = wrap(theme.object.ctor, object.ctor)
  if (object.stringTag && object.stringTag !== object.ctor && object.stringTag !== 'Object') {
    retval += ' ' + wrap(theme.object.secondaryStringTag, object.stringTag)
  }
  return retval
}
exports.formatCtorAndStringTag = formatCtorAndStringTag

class ObjectFormatter {
  constructor (object, theme, indent) {
    this.object = object
    this.theme = theme
    this.indent = indent

    this.increaseIndent = true

    this.innerLines = lineBuilder.buffer()
    this.pendingStats = null
  }

  append (formatted, origin) {
    if (origin.isStats === true) {
      this.pendingStats = formatted
    } else {
      if (this.pendingStats !== null) {
        if (!this.innerLines.isEmpty) {
          this.innerLines.append(this.pendingStats)
        }
        this.pendingStats = null
      }
      this.innerLines.append(formatted)
    }
  }

  finalize () {
    const variant = this.object.isList
      ? this.theme.list
      : this.theme.object

    const ctor = this.object.ctor
    const stringTag = this.object.stringTag
    const prefix = (ctor === 'Array' || ctor === 'Object') && ctor === stringTag
      ? ''
      : formatCtorAndStringTag(this.theme, this.object) + ' '

    if (this.innerLines.isEmpty) {
      return lineBuilder.single(prefix + variant.openBracket + variant.closeBracket)
    }

    return lineBuilder.first(prefix + variant.openBracket)
      .concat(this.innerLines.withFirstPrefixed(this.indent.increase()).stripFlags())
      .append(lineBuilder.last(this.indent + variant.closeBracket))
  }

  maxDepth () {
    const variant = this.object.isList
      ? this.theme.list
      : this.theme.object

    return lineBuilder.single(
      formatCtorAndStringTag(this.theme, this.object) + ' ' + variant.openBracket +
      ' ' + this.theme.maxDepth + ' ' + variant.closeBracket)
  }

  shouldFormat () {
    return true
  }

  customize (methods) {
    if (methods.finalize) {
      this.finalize = () => methods.finalize(this.innerLines)
    }
    if (methods.maxDepth) {
      this.maxDepth = methods.maxDepth
    }
    if (methods.shouldFormat) {
      this.shouldFormat = methods.shouldFormat
    }

    return this
  }
}
exports.ObjectFormatter = ObjectFormatter

class SingleValueFormatter {
  constructor (theme, finalizeFn, increaseIndent) {
    this.theme = theme
    this.finalizeFn = finalizeFn
    this.hasValue = false
    this.increaseIndent = increaseIndent === true
    this.value = null
  }

  append (formatted) {
    if (this.hasValue) throw new Error('Formatter buffer can only take one formatted value.')

    this.hasValue = true
    this.value = formatted
  }

  finalize () {
    if (!this.hasValue) throw new Error('Formatter buffer never received a formatted value.')

    return this.finalizeFn(this.value)
  }

  maxDepth () {
    return this.finalizeFn(lineBuilder.single(this.theme.maxDepth))
  }
}
exports.SingleValueFormatter = SingleValueFormatter
