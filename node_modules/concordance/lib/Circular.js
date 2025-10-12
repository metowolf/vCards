'use strict'

class Circular {
  constructor () {
    this.stack = new Map()
  }

  add (descriptor) {
    if (this.stack.has(descriptor)) throw new Error('Already in stack')

    if (descriptor.isItem !== true && descriptor.isMapEntry !== true && descriptor.isProperty !== true) {
      this.stack.set(descriptor, this.stack.size + 1)
    }
    return this
  }

  delete (descriptor) {
    if (this.stack.has(descriptor)) {
      if (this.stack.get(descriptor) !== this.stack.size) throw new Error('Not on top of stack')
      this.stack.delete(descriptor)
    }
    return this
  }

  has (descriptor) {
    return this.stack.has(descriptor)
  }

  get (descriptor) {
    return this.stack.has(descriptor)
      ? this.stack.get(descriptor)
      : 0
  }
}
module.exports = Circular
