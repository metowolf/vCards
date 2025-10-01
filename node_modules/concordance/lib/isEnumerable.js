'use strict'

function isEnumerable (obj, key) {
  const desc = Object.getOwnPropertyDescriptor(obj, key)
  return desc && desc.enumerable
}
module.exports = isEnumerable
