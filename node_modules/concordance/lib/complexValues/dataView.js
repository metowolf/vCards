'use strict'

const typedArray = require('./typedArray')

function describe (props) {
  return new DescribedDataViewValue(Object.assign({
    buffer: typedArray.getBuffer(props.value),
    // Set isArray and isList so the property recursor excludes the byte accessors
    isArray: true,
    isList: true,
  }, props))
}
exports.describe = describe

function deserialize (state, recursor) {
  return new DeserializedDataViewValue(state, recursor)
}
exports.deserialize = deserialize

const tag = Symbol('DataViewValue')
exports.tag = tag

// DataViews can be represented as regular Buffers, allowing them to be treated
// as TypedArrays for the purposes of this package.
class DataViewValue extends typedArray.TypedArrayValue {}
Object.defineProperty(DataViewValue.prototype, 'tag', { value: tag })

const DescribedDataViewValue = typedArray.DescribedMixin(DataViewValue)
const DeserializedDataViewValue = typedArray.DeserializedMixin(DataViewValue)
