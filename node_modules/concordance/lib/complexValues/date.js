'use strict'

const dateTime = require('date-time')

const constants = require('../constants')
const formatUtils = require('../formatUtils')
const lineBuilder = require('../lineBuilder')
const object = require('./object')

const SHALLOW_EQUAL = constants.SHALLOW_EQUAL
const UNEQUAL = constants.UNEQUAL

function describe (props) {
  const date = props.value
  const invalid = isNaN(date.valueOf())
  return new DescribedDateValue(Object.assign({}, props, { invalid }))
}
exports.describe = describe

function deserialize (state, recursor) {
  return new DeserializedDateValue(state, recursor)
}
exports.deserialize = deserialize

const tag = Symbol('DateValue')
exports.tag = tag

function formatDate (date) {
  // Always format in UTC. The local timezone shouldn't be used since it's most
  // likely different from that of CI servers.
  return dateTime({
    date,
    local: false,
    showTimeZone: true,
    showMilliseconds: true,
  })
}

class DateValue extends object.ObjectValue {
  constructor (props) {
    super(props)
    this.invalid = props.invalid
  }

  compare (expected) {
    const result = super.compare(expected)
    if (result !== SHALLOW_EQUAL) return result

    return (this.invalid && expected.invalid) || Object.is(this.value.getTime(), expected.value.getTime())
      ? SHALLOW_EQUAL
      : UNEQUAL
  }

  formatShallow (theme, indent) {
    const string = formatUtils.formatCtorAndStringTag(theme, this) + ' ' +
      (this.invalid ? theme.date.invalid : formatUtils.wrap(theme.date.value, formatDate(this.value))) + ' ' +
      theme.object.openBracket

    return super.formatShallow(theme, indent).customize({
      finalize (innerLines) {
        return innerLines.isEmpty
          ? lineBuilder.single(string + theme.object.closeBracket)
          : lineBuilder.first(string)
            .concat(innerLines.withFirstPrefixed(indent.increase()).stripFlags())
            .append(lineBuilder.last(indent + theme.object.closeBracket))
      },

      maxDepth () {
        return lineBuilder.single(string + ' ' + theme.maxDepth + ' ' + theme.object.closeBracket)
      },
    })
  }

  serialize () {
    const iso = this.invalid ? null : this.value.toISOString()
    return [this.invalid, iso, super.serialize()]
  }
}
Object.defineProperty(DateValue.prototype, 'tag', { value: tag })

const DescribedDateValue = object.DescribedMixin(DateValue)

class DeserializedDateValue extends object.DeserializedMixin(DateValue) {
  constructor (state, recursor) {
    super(state[2], recursor)
    this.invalid = state[0]
    this.value = new Date(this.invalid ? NaN : state[1])
  }
}
