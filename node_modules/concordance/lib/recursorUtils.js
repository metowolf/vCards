'use strict'

const NOOP_RECURSOR = {
  size: 0,
  next () { return null },
}
exports.NOOP_RECURSOR = NOOP_RECURSOR

function fork (recursor) {
  const buffer = []

  return {
    shared () {
      const next = recursor()
      if (next !== null) buffer.push(next)
      return next
    },

    recursor () {
      if (buffer.length > 0) return buffer.shift()
      return recursor()
    },
  }
}
exports.fork = fork

function consumeDeep (recursor) {
  const stack = [recursor]
  while (stack.length > 0) {
    const subject = stack[stack.length - 1]()
    if (subject === null) {
      stack.pop()
      continue
    }

    if (typeof subject.createRecursor === 'function') {
      stack.push(subject.createRecursor())
    }
  }
}
exports.consumeDeep = consumeDeep

function map (recursor, mapFn) {
  return () => {
    const next = recursor()
    if (next === null) return null

    return mapFn(next)
  }
}
exports.map = map

function replay (state, create) {
  if (!state) {
    const recursor = create()
    if (recursor === NOOP_RECURSOR) {
      state = recursor
    } else {
      state = Object.assign({
        buffer: [],
        done: false,
      }, recursor)
    }
  }

  if (state === NOOP_RECURSOR) return { state, recursor: state }

  let done = false
  let index = 0
  const next = () => {
    if (done) return null

    let retval = state.buffer[index]
    if (retval === undefined) {
      retval = state.buffer[index] = state.next()
    }

    index++
    if (retval === null) {
      done = true
    }
    return retval
  }

  return { state, recursor: { next, size: state.size } }
}
exports.replay = replay

function sequence (first, second) {
  let fromFirst = true
  return () => {
    if (fromFirst) {
      const next = first()
      if (next !== null) return next

      fromFirst = false
    }

    return second()
  }
}
exports.sequence = sequence

function singleValue (value) {
  let done = false
  return () => {
    if (done) return null

    done = true
    return value
  }
}
exports.singleValue = singleValue

function unshift (recursor, value) {
  return () => {
    if (value !== null) {
      const next = value
      value = null
      return next
    }

    return recursor()
  }
}
exports.unshift = unshift
