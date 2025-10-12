'use strict'

const ACTUAL = Symbol('lineBuilder.gutters.ACTUAL')
const EXPECTED = Symbol('lineBuilder.gutters.EXPECTED')

function translateGutter (theme, invert, gutter) {
  if (invert) {
    if (gutter === ACTUAL) return theme.diffGutters.expected
    if (gutter === EXPECTED) return theme.diffGutters.actual
  } else {
    if (gutter === ACTUAL) return theme.diffGutters.actual
    if (gutter === EXPECTED) return theme.diffGutters.expected
  }
  return theme.diffGutters.padding
}

class Line {
  constructor (isFirst, isLast, gutter, stringValue) {
    this.isFirst = isFirst
    this.isLast = isLast
    this.gutter = gutter
    this.stringValue = stringValue
  }

  * [Symbol.iterator] () {
    yield this
  }

  get isEmpty () {
    return false
  }

  get hasGutter () {
    return this.gutter !== null
  }

  get isSingle () {
    return this.isFirst && this.isLast
  }

  append (other) {
    return this.concat(other)
  }

  concat (other) {
    return new Collection()
      .append(this)
      .append(other)
  }

  toString (options) {
    if (options.diff === false) return this.stringValue

    return translateGutter(options.theme, options.invert, this.gutter) + this.stringValue
  }

  mergeWithInfix (infix, other) {
    if (other.isLine !== true) {
      return new Collection()
        .append(this)
        .mergeWithInfix(infix, other)
    }

    return new Line(this.isFirst, other.isLast, other.gutter, this.stringValue + infix + other.stringValue)
  }

  withFirstPrefixed (prefix) {
    if (!this.isFirst) return this

    return new Line(true, this.isLast, this.gutter, prefix + this.stringValue)
  }

  withLastPostfixed (postfix) {
    if (!this.isLast) return this

    return new Line(this.isFirst, true, this.gutter, this.stringValue + postfix)
  }

  stripFlags () {
    return new Line(false, false, this.gutter, this.stringValue)
  }

  decompose () {
    return new Collection()
      .append(this)
      .decompose()
  }
}
Object.defineProperty(Line.prototype, 'isLine', { value: true })

class Collection {
  constructor () {
    this.buffer = []
  }

  * [Symbol.iterator] () {
    for (const appended of this.buffer) {
      for (const line of appended) yield line
    }
  }

  get isEmpty () {
    return this.buffer.length === 0
  }

  get hasGutter () {
    for (const line of this) {
      if (line.hasGutter) return true
    }
    return false
  }

  get isSingle () {
    const iterator = this[Symbol.iterator]()
    iterator.next()
    return iterator.next().done === true
  }

  append (lineOrLines) {
    if (!lineOrLines.isEmpty) this.buffer.push(lineOrLines)
    return this
  }

  concat (other) {
    return new Collection()
      .append(this)
      .append(other)
  }

  toString (options) {
    let lines = this

    if (options.invert) {
      lines = new Collection()
      let buffer = new Collection()

      let prev = null
      for (const line of this) {
        if (line.gutter === ACTUAL) {
          if (prev !== null && prev.gutter !== ACTUAL && !buffer.isEmpty) {
            lines.append(buffer)
            buffer = new Collection()
          }

          buffer.append(line)
        } else if (line.gutter === EXPECTED) {
          lines.append(line)
        } else {
          if (!buffer.isEmpty) {
            lines.append(buffer)
            buffer = new Collection()
          }

          lines.append(line)
        }

        prev = line
      }
      lines.append(buffer)
    }

    return Array.from(lines, line => line.toString(options)).join('\n')
  }

  mergeWithInfix (infix, from) {
    if (from.isEmpty) throw new Error('Cannot merge, `from` is empty.')

    const otherLines = Array.from(from)
    if (!otherLines[0].isFirst) throw new Error('Cannot merge, `from` has no first line.')

    const merged = new Collection()
    let seenLast = false
    for (const line of this) {
      if (seenLast) throw new Error('Cannot merge line, the last line has already been seen.')

      if (!line.isLast) {
        merged.append(line)
        continue
      }

      seenLast = true
      for (const other of otherLines) {
        if (other.isFirst) {
          merged.append(line.mergeWithInfix(infix, other))
        } else {
          merged.append(other)
        }
      }
    }
    return merged
  }

  withFirstPrefixed (prefix) {
    return new Collection()
      .append(Array.from(this, line => line.withFirstPrefixed(prefix)))
  }

  withLastPostfixed (postfix) {
    return new Collection()
      .append(Array.from(this, line => line.withLastPostfixed(postfix)))
  }

  stripFlags () {
    return new Collection()
      .append(Array.from(this, line => line.stripFlags()))
  }

  decompose () {
    const first = { actual: new Collection(), expected: new Collection() }
    const last = { actual: new Collection(), expected: new Collection() }
    const remaining = new Collection()

    for (const line of this) {
      if (line.isFirst && line.gutter === ACTUAL) {
        first.actual.append(line)
      } else if (line.isFirst && line.gutter === EXPECTED) {
        first.expected.append(line)
      } else if (line.isLast && line.gutter === ACTUAL) {
        last.actual.append(line)
      } else if (line.isLast && line.gutter === EXPECTED) {
        last.expected.append(line)
      } else {
        remaining.append(line)
      }
    }

    return { first, last, remaining }
  }
}
Object.defineProperty(Collection.prototype, 'isCollection', { value: true })

function setDefaultGutter (iterable, gutter) {
  return new Collection()
    .append(Array.from(iterable, line => {
      return line.gutter === null
        ? new Line(line.isFirst, line.isLast, gutter, line.stringValue)
        : line
    }))
}

module.exports = {
  buffer () {
    return new Collection()
  },

  first (stringValue) {
    return new Line(true, false, null, stringValue)
  },

  last (stringValue) {
    return new Line(false, true, null, stringValue)
  },

  line (stringValue) {
    return new Line(false, false, null, stringValue)
  },

  single (stringValue) {
    return new Line(true, true, null, stringValue)
  },

  setDefaultGutter (lineOrCollection) {
    return lineOrCollection
  },

  actual: {
    first (stringValue) {
      return new Line(true, false, ACTUAL, stringValue)
    },

    last (stringValue) {
      return new Line(false, true, ACTUAL, stringValue)
    },

    line (stringValue) {
      return new Line(false, false, ACTUAL, stringValue)
    },

    single (stringValue) {
      return new Line(true, true, ACTUAL, stringValue)
    },

    setDefaultGutter (lineOrCollection) {
      return setDefaultGutter(lineOrCollection, ACTUAL)
    },
  },

  expected: {
    first (stringValue) {
      return new Line(true, false, EXPECTED, stringValue)
    },

    last (stringValue) {
      return new Line(false, true, EXPECTED, stringValue)
    },

    line (stringValue) {
      return new Line(false, false, EXPECTED, stringValue)
    },

    single (stringValue) {
      return new Line(true, true, EXPECTED, stringValue)
    },

    setDefaultGutter (lineOrCollection) {
      return setDefaultGutter(lineOrCollection, EXPECTED)
    },
  },
}
