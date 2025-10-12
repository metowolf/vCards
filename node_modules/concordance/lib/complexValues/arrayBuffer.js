'use strict'

const typedArray = require('./typedArray')

function describe (props) {
  return new DescribedArrayBufferValue(Object.assign({
    buffer: Buffer.from(props.value),
    // Set isArray and isList so the property recursor excludes the byte accessors
    isArray: true,
    isList: true,
  }, props))
}
exports.describe = describe

function deserialize (state, recursor) {
  return new DeserializedArrayBufferValue(state, recursor)
}
exports.deserialize = deserialize

const tag = Symbol('ArrayBufferValue')
exports.tag = tag

// ArrayBuffers can be represented as regular Buffers, allowing them to be
// treated as TypedArrays for the purposes of this package.
class ArrayBufferValue extends typedArray.TypedArrayValue {}
Object.defineProperty(ArrayBufferValue.prototype, 'tag', { value: tag })

const DescribedArrayBufferValue = typedArray.DescribedMixin(ArrayBufferValue)
const DeserializedArrayBufferValue = typedArray.DeserializedMixin(ArrayBufferValue)
