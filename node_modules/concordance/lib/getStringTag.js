'use strict'

const ts = Object.prototype.toString
function getStringTag (value) {
  return ts.call(value).slice(8, -1)
}

const fts = Function.prototype.toString
const promiseCtorString = fts.call(Promise)
const isPromise = value => {
  if (!value.constructor) return false

  try {
    return fts.call(value.constructor) === promiseCtorString
  } catch {
    return false
  }
}

if (getStringTag(Promise.resolve()) === 'Promise') {
  module.exports = getStringTag
} else {
  const getStringTagWithPromiseWorkaround = value => {
    const stringTag = getStringTag(value)
    return stringTag === 'Object' && isPromise(value)
      ? 'Promise'
      : stringTag
  }
  module.exports = getStringTagWithPromiseWorkaround
}
