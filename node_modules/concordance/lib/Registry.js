'use strict'

class Registry {
  constructor () {
    this.counter = 0
    this.map = new WeakMap()
  }

  has (value) {
    return this.map.has(value)
  }

  get (value) {
    return this.map.get(value).descriptor
  }

  alloc (value) {
    const index = ++this.counter
    const pointer = { descriptor: null, index }
    this.map.set(value, pointer)
    return pointer
  }
}
module.exports = Registry
