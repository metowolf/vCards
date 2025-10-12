'use strict'

const flattenDeep = require('lodash/flattenDeep')

// Indexes are hexadecimal to make reading the binary output easier.
const valueTypes = {
  zero: 0x00,
  int8: 0x01, // Note that the hex value equals the number of bytes required
  int16: 0x02, // to store the integer.
  int24: 0x03,
  int32: 0x04,
  int40: 0x05,
  int48: 0x06,
  numberString: 0x07,
  negativeZero: 0x08,
  notANumber: 0x09,
  infinity: 0x0A,
  negativeInfinity: 0x0B,
  bigInt: 0x0C,
  undefined: 0x0D,
  null: 0x0E,
  true: 0x0F,
  false: 0x10,
  utf8: 0x11,
  bytes: 0x12,
  list: 0x13,
  descriptor: 0x14,
}

const descriptorSymbol = Symbol('descriptor')
exports.descriptorSymbol = descriptorSymbol

function encodeInteger (type, value) {
  const encoded = Buffer.alloc(type)
  encoded.writeIntLE(value, 0, type)
  return [type, encoded]
}

function encodeValue (value) {
  if (Object.is(value, 0)) return valueTypes.zero
  if (Object.is(value, -0)) return valueTypes.negativeZero
  if (Object.is(value, NaN)) return valueTypes.notANumber
  if (value === Infinity) return valueTypes.infinity
  if (value === -Infinity) return valueTypes.negativeInfinity
  if (value === undefined) return valueTypes.undefined
  if (value === null) return valueTypes.null
  if (value === true) return valueTypes.true
  if (value === false) return valueTypes.false

  const type = typeof value
  if (type === 'number') {
    if (Number.isInteger(value)) {
      // The integer types are signed, so int8 can only store 7 bits, int16
      // only 15, etc.
      if (value >= -0x80 && value < 0x80) return encodeInteger(valueTypes.int8, value)
      if (value >= -0x8000 && value < 0x8000) return encodeInteger(valueTypes.int16, value)
      if (value >= -0x800000 && value < 0x800000) return encodeInteger(valueTypes.int24, value)
      if (value >= -0x80000000 && value < 0x80000000) return encodeInteger(valueTypes.int32, value)
      if (value >= -0x8000000000 && value < 0x8000000000) return encodeInteger(valueTypes.int40, value)
      if (value >= -0x800000000000 && value < 0x800000000000) return encodeInteger(valueTypes.int48, value)
      // Fall through to encoding the value as a number string.
    }

    const encoded = Buffer.from(String(value), 'utf8')
    return [valueTypes.numberString, encodeValue(encoded.length), encoded]
  }

  if (type === 'string') {
    const encoded = Buffer.from(value, 'utf8')
    return [valueTypes.utf8, encodeValue(encoded.length), encoded]
  }

  if (type === 'bigint') {
    const encoded = Buffer.from(String(value), 'utf8')
    return [valueTypes.bigInt, encodeValue(encoded.length), encoded]
  }

  if (Buffer.isBuffer(value)) {
    return [valueTypes.bytes, encodeValue(value.byteLength), value]
  }

  if (Array.isArray(value)) {
    return [
      value[descriptorSymbol] === true ? valueTypes.descriptor : valueTypes.list,
      encodeValue(value.length),
      value.map(x => encodeValue(x)),
    ]
  }

  const hex = `0x${type.toString(16).toUpperCase()}`
  throw new TypeError(`Unexpected value with type ${hex}`)
}

function decodeValue (buffer, byteOffset) {
  const type = buffer.readUInt8(byteOffset)
  byteOffset += 1

  if (type === valueTypes.zero) return { byteOffset, value: 0 }
  if (type === valueTypes.negativeZero) return { byteOffset, value: -0 }
  if (type === valueTypes.notANumber) return { byteOffset, value: NaN }
  if (type === valueTypes.infinity) return { byteOffset, value: Infinity }
  if (type === valueTypes.negativeInfinity) return { byteOffset, value: -Infinity }
  if (type === valueTypes.undefined) return { byteOffset, value: undefined }
  if (type === valueTypes.null) return { byteOffset, value: null }
  if (type === valueTypes.true) return { byteOffset, value: true }
  if (type === valueTypes.false) return { byteOffset, value: false }

  if (
    type === valueTypes.int8 || type === valueTypes.int16 || type === valueTypes.int24 ||
    type === valueTypes.int32 || type === valueTypes.int40 || type === valueTypes.int48
  ) {
    const value = buffer.readIntLE(byteOffset, type)
    byteOffset += type
    return { byteOffset, value }
  }

  if (type === valueTypes.numberString || type === valueTypes.utf8 || type === valueTypes.bytes || type === valueTypes.bigInt) {
    const length = decodeValue(buffer, byteOffset)
    const start = length.byteOffset
    const end = start + length.value

    if (type === valueTypes.numberString) {
      const value = Number(buffer.toString('utf8', start, end))
      return { byteOffset: end, value }
    }

    if (type === valueTypes.utf8) {
      const value = buffer.toString('utf8', start, end)
      return { byteOffset: end, value }
    }

    if (type === valueTypes.bigInt) {
      const value = BigInt(buffer.toString('utf8', start, end)) // eslint-disable-line no-undef
      return { byteOffset: end, value }
    }

    const value = buffer.slice(start, end)
    return { byteOffset: end, value }
  }

  if (type === valueTypes.list || type === valueTypes.descriptor) {
    const length = decodeValue(buffer, byteOffset)
    byteOffset = length.byteOffset

    const value = new Array(length.value)
    if (type === valueTypes.descriptor) {
      value[descriptorSymbol] = true
    }

    for (let index = 0; index < length.value; index++) {
      const item = decodeValue(buffer, byteOffset)
      byteOffset = item.byteOffset
      value[index] = item.value
    }

    return { byteOffset, value }
  }

  const hex = `0x${type.toString(16).toUpperCase()}`
  throw new TypeError(`Could not decode type ${hex}`)
}

function buildBuffer (numberOrArray) {
  if (typeof numberOrArray === 'number') {
    const byte = Buffer.alloc(1)
    byte.writeUInt8(numberOrArray)
    return byte
  }

  const array = flattenDeep(numberOrArray)
  const buffers = new Array(array.length)
  let byteLength = 0
  for (const [index, element] of array.entries()) {
    if (typeof element === 'number') {
      byteLength += 1
      const byte = Buffer.alloc(1)
      byte.writeUInt8(element)
      buffers[index] = byte
    } else {
      byteLength += element.byteLength
      buffers[index] = element
    }
  }
  return Buffer.concat(buffers, byteLength)
}

function encode (serializerVersion, rootRecord, usedPlugins) {
  const buffers = []
  let byteOffset = 0

  const versionHeader = Buffer.alloc(2)
  versionHeader.writeUInt16LE(serializerVersion)
  buffers.push(versionHeader)
  byteOffset += versionHeader.byteLength

  const rootOffset = Buffer.alloc(4)
  buffers.push(rootOffset)
  byteOffset += rootOffset.byteLength

  const numPlugins = buildBuffer(encodeValue(usedPlugins.size))
  buffers.push(numPlugins)
  byteOffset += numPlugins.byteLength

  for (const name of usedPlugins.keys()) {
    const plugin = usedPlugins.get(name)
    const record = buildBuffer([
      encodeValue(name),
      encodeValue(plugin.serializerVersion),
    ])
    buffers.push(record)
    byteOffset += record.byteLength
  }

  const queue = [rootRecord]
  const pointers = [rootOffset]
  while (queue.length > 0) {
    pointers.shift().writeUInt32LE(byteOffset, 0)

    const record = queue.shift()
    const recordHeader = buildBuffer([
      encodeValue(record.pluginIndex),
      encodeValue(record.id),
      encodeValue(record.children.length),
    ])
    buffers.push(recordHeader)
    byteOffset += recordHeader.byteLength

    // Add pointers before encoding the state. This allows, if it ever becomes
    // necessary, for records to be extracted from a buffer without having to
    // parse the (variable length) state field.
    for (const child of record.children) {
      queue.push(child)

      const pointer = Buffer.alloc(4)
      pointers.push(pointer)
      buffers.push(pointer)
      byteOffset += 4
    }

    const state = buildBuffer(encodeValue(record.state))
    buffers.push(state)
    byteOffset += state.byteLength
  }

  return Buffer.concat(buffers, byteOffset)
}
exports.encode = encode

function decodePlugins (buffer) {
  const $numPlugins = decodeValue(buffer, 0)
  let byteOffset = $numPlugins.byteOffset

  const usedPlugins = new Map()
  const lastIndex = $numPlugins.value
  for (let index = 1; index <= lastIndex; index++) {
    const $name = decodeValue(buffer, byteOffset)
    const name = $name.value
    byteOffset = $name.byteOffset

    const serializerVersion = decodeValue(buffer, byteOffset).value
    usedPlugins.set(index, { name, serializerVersion })
  }

  return usedPlugins
}
exports.decodePlugins = decodePlugins

function decodeRecord (buffer, byteOffset) {
  const $pluginIndex = decodeValue(buffer, byteOffset)
  const pluginIndex = $pluginIndex.value
  byteOffset = $pluginIndex.byteOffset

  const $id = decodeValue(buffer, byteOffset)
  const id = $id.value
  byteOffset = $id.byteOffset

  const $numPointers = decodeValue(buffer, byteOffset)
  const numPointers = $numPointers.value
  byteOffset = $numPointers.byteOffset

  const pointerAddresses = new Array(numPointers)
  for (let index = 0; index < numPointers; index++) {
    pointerAddresses[index] = buffer.readUInt32LE(byteOffset)
    byteOffset += 4
  }

  const state = decodeValue(buffer, byteOffset).value
  return { id, pluginIndex, state, pointerAddresses }
}
exports.decodeRecord = decodeRecord

function extractVersion (buffer) {
  return buffer.readUInt16LE(0)
}
exports.extractVersion = extractVersion

function decode (buffer) {
  const rootOffset = buffer.readUInt32LE(2)
  const pluginBuffer = buffer.slice(6, rootOffset)
  const rootRecord = decodeRecord(buffer, rootOffset)
  return { pluginBuffer, rootRecord }
}
exports.decode = decode
