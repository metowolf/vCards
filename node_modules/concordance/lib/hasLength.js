'use strict'

const isLength = require('lodash/isLength')

const hop = Object.prototype.hasOwnProperty

function hasLength (obj) {
  return (
    Array.isArray(obj) ||
    (hop.call(obj, 'length') &&
      isLength(obj.length) &&
      (obj.length === 0 || '0' in obj))
  )
}
module.exports = hasLength
