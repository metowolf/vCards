'use strict'

const hop = Object.prototype.hasOwnProperty

function getCtor (stringTag, value) {
  if (value.constructor) {
    const name = value.constructor.name
    return typeof name === 'string' && name !== ''
      ? name
      : null
  }

  if (value.constructor === undefined) {
    if (stringTag !== 'Object' || value instanceof Object) return null

    // Values without a constructor, that do not inherit from `Object`, but are
    // tagged as objects, may come from `Object.create(null)`. Or they can come
    // from a different realm, e.g.:
    //
    // ```
    // require('vm').runInNewContext(`
    //   const Foo = function () {}
    //   Foo.prototype.constructor = undefined
    //   return new Foo()
    // `)
    // ```
    //
    // Treat such objects as if they came from `Object.create(null)` (in the
    // current realm) only if they do not have inherited properties. This allows
    // these objects to be compared with object literals.
    //
    // This means `Object.create(null)` is not differentiated from `{}`.

    // Using `const` prevents Crankshaft optimizations
    for (var p in value) { // eslint-disable-line no-var
      if (!hop.call(value, p)) return null
    }
    return stringTag
  }

  return null
}
module.exports = getCtor
