'use strict'

const compare = require('./lib/compare')
const describe = require('./lib/describe')
const diff = require('./lib/diff')
const format = require('./lib/format')
const serialize = require('./lib/serialize')

exports.compare = compare.compare
exports.compareDescriptors = compare.compareDescriptors

exports.describe = describe

exports.diff = diff.diff
exports.diffDescriptors = diff.diffDescriptors

exports.format = format.format
exports.formatDescriptor = format.formatDescriptor

exports.serialize = serialize.serialize
exports.deserialize = serialize.deserialize
