'use strict'

class Indenter {
  constructor (level, step) {
    this.level = level
    this.step = step
    this.value = step.repeat(level)
  }

  increase () {
    return new Indenter(this.level + 1, this.step)
  }

  decrease () {
    return new Indenter(this.level - 1, this.step)
  }

  toString () {
    return this.value
  }
}
module.exports = Indenter
