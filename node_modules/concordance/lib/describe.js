'use strict'

const Registry = require('./Registry')
const argumentsValue = require('./complexValues/arguments')
const arrayBufferValue = require('./complexValues/arrayBuffer')
const boxedValue = require('./complexValues/boxed')
const dataViewValue = require('./complexValues/dataView')
const dateValue = require('./complexValues/date')
const errorValue = require('./complexValues/error')
const functionValue = require('./complexValues/function')
const globalValue = require('./complexValues/global')
const mapValue = require('./complexValues/map')
const objectValue = require('./complexValues/object')
const promiseValue = require('./complexValues/promise')
const regexpValue = require('./complexValues/regexp')
const setValue = require('./complexValues/set')
const typedArrayValue = require('./complexValues/typedArray')

const getCtor = require('./getCtor')
const getStringTag = require('./getStringTag')
const itemDescriptor = require('./metaDescriptors/item')
const mapEntryDescriptor = require('./metaDescriptors/mapEntry')
const propertyDescriptor = require('./metaDescriptors/property')

const pluginRegistry = require('./pluginRegistry')
const bigIntValue = require('./primitiveValues/bigInt')
const booleanValue = require('./primitiveValues/boolean')
const nullValue = require('./primitiveValues/null')
const numberValue = require('./primitiveValues/number')
const stringValue = require('./primitiveValues/string')
const symbolValue = require('./primitiveValues/symbol')
const undefinedValue = require('./primitiveValues/undefined')

const SpecializedComplexes = new Map([
  ['Arguments', argumentsValue.describe],
  ['ArrayBuffer', arrayBufferValue.describe],
  ['DataView', dataViewValue.describe],
  ['Date', dateValue.describe],
  ['Error', errorValue.describe],
  ['Float32Array', typedArrayValue.describe],
  ['Float64Array', typedArrayValue.describe],
  ['Function', functionValue.describe],
  ['GeneratorFunction', functionValue.describe],
  ['global', globalValue.describe],
  ['Int16Array', typedArrayValue.describe],
  ['Int32Array', typedArrayValue.describe],
  ['Int8Array', typedArrayValue.describe],
  ['Map', mapValue.describe],
  ['Promise', promiseValue.describe],
  ['RegExp', regexpValue.describe],
  ['Set', setValue.describe],
  ['Uint16Array', typedArrayValue.describe],
  ['Uint32Array', typedArrayValue.describe],
  ['Uint8Array', typedArrayValue.describe],
  ['Uint8ClampedArray', typedArrayValue.describe],
])

function describePrimitive (value) {
  if (value === null) return nullValue.describe()
  if (value === undefined) return undefinedValue.describe()
  if (value === true || value === false) return booleanValue.describe(value)

  const type = typeof value
  if (type === 'bigint') return bigIntValue.describe(value)
  if (type === 'number') return numberValue.describe(value)
  if (type === 'string') return stringValue.describe(value)
  if (type === 'symbol') return symbolValue.describe(value)

  return null
}

function unboxComplex (tag, complex) {
  // Try to unbox by calling `valueOf()`. `describePrimitive()` will return
  // `null` if the resulting value is not a primitive, in which case it's
  // ignored.
  if (typeof complex.valueOf === 'function') {
    const value = complex.valueOf()
    if (value !== complex) return describePrimitive(value)
  }

  return null
}

function registerPlugins (plugins) {
  if (!Array.isArray(plugins) || plugins.length === 0) return () => null

  const tryFns = pluginRegistry.getTryDescribeValues(plugins)
  return (value, stringTag, ctor) => {
    for (const tryDescribeValue of tryFns) {
      const describeValue = tryDescribeValue(value, stringTag, ctor)
      if (describeValue) return describeValue
    }

    return null
  }
}

function describeComplex (value, registry, tryPlugins, describeAny, describeItem, describeMapEntry, describeProperty) {
  if (registry.has(value)) return registry.get(value)

  const stringTag = getStringTag(value)
  const ctor = getCtor(stringTag, value)
  const pointer = registry.alloc(value)

  let unboxed
  let describeValue = tryPlugins(value, stringTag, ctor)
  if (describeValue === null) {
    if (SpecializedComplexes.has(stringTag)) {
      describeValue = SpecializedComplexes.get(stringTag)
    } else {
      unboxed = unboxComplex(stringTag, value)
      if (unboxed !== null) {
        describeValue = boxedValue.describe
      } else {
        describeValue = objectValue.describe
      }
    }
  }

  const descriptor = describeValue({
    ctor,
    describeAny,
    describeItem,
    describeMapEntry,
    describeProperty,
    pointer: pointer.index,
    stringTag,
    unboxed,
    value,
  })
  pointer.descriptor = descriptor
  return descriptor
}

const describeItem = (index, valueDescriptor) => {
  return valueDescriptor.isPrimitive === true
    ? itemDescriptor.describePrimitive(index, valueDescriptor)
    : itemDescriptor.describeComplex(index, valueDescriptor)
}

const describeMapEntry = (keyDescriptor, valueDescriptor) => {
  return mapEntryDescriptor.describe(keyDescriptor, valueDescriptor)
}

function describe (value, options) {
  const primitive = describePrimitive(value)
  if (primitive !== null) return primitive

  const registry = new Registry()
  const tryPlugins = registerPlugins(options && options.plugins)
  const curriedComplex = c => {
    return describeComplex(c, registry, tryPlugins, describeAny, describeItem, describeMapEntry, describeProperty)
  }

  const describeAny = any => {
    const descriptor = describePrimitive(any)
    return descriptor !== null
      ? descriptor
      : curriedComplex(any)
  }

  const describeProperty = (key, valueDescriptor) => {
    const keyDescriptor = describePrimitive(key)
    return valueDescriptor.isPrimitive === true
      ? propertyDescriptor.describePrimitive(keyDescriptor, valueDescriptor)
      : propertyDescriptor.describeComplex(keyDescriptor, valueDescriptor)
  }

  return curriedComplex(value)
}
module.exports = describe
