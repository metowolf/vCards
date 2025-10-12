'use strict'

const semver = require('semver')

const pkg = require('../package.json')
const object = require('./complexValues/object')
const constants = require('./constants')
const formatUtils = require('./formatUtils')
const lineBuilder = require('./lineBuilder')
const itemDescriptor = require('./metaDescriptors/item')
const propertyDescriptor = require('./metaDescriptors/property')
const stringDescriptor = require('./primitiveValues/string')
const recursorUtils = require('./recursorUtils')
const themeUtils = require('./themeUtils')

const API_VERSION = 1
const CONCORDANCE_VERSION = pkg.version

const descriptorRegistry = new Map()
const registry = new Map()

class PluginError extends Error {
  constructor (message, plugin) {
    super(message)
    this.name = 'PluginError'
    this.plugin = plugin
  }
}

class PluginTypeError extends TypeError {
  constructor (message, plugin) {
    super(message)
    this.name = 'PluginTypeError'
    this.plugin = plugin
  }
}

class UnsupportedApiError extends PluginError {
  constructor (plugin) {
    super('Plugin requires an unsupported API version', plugin)
    this.name = 'UnsupportedApiError'
  }
}

class UnsupportedError extends PluginError {
  constructor (plugin) {
    super('Plugin does not support this version of Concordance', plugin)
    this.name = 'UnsupportedError'
  }
}

class DuplicateDescriptorTagError extends PluginError {
  constructor (tag, plugin) {
    super(`Could not add descriptor: tag ${String(tag)} has already been registered`, plugin)
    this.name = 'DuplicateDescriptorTagError'
    this.tag = tag
  }
}

class DuplicateDescriptorIdError extends PluginError {
  constructor (id, plugin) {
    const printed = typeof id === 'number'
      ? `0x${id.toString(16).toUpperCase()}`
      : String(id)
    super(`Could not add descriptor: id ${printed} has already been registered`, plugin)
    this.name = 'DuplicateDescriptorIdError'
    this.id = id
  }
}

function verify (plugin) {
  if (typeof plugin.name !== 'string' || !plugin.name) {
    throw new PluginTypeError('Plugin must have a `name`', plugin)
  }

  if (plugin.apiVersion !== API_VERSION) {
    throw new UnsupportedApiError(plugin)
  }

  if ('minimalConcordanceVersion' in plugin) {
    if (!semver.valid(plugin.minimalConcordanceVersion)) {
      throw new PluginTypeError('If specified, `minimalConcordanceVersion` must be a valid SemVer version', plugin)
    }

    const range = `>=${plugin.minimalConcordanceVersion}`
    if (!semver.satisfies(CONCORDANCE_VERSION, range)) {
      throw new UnsupportedError(plugin)
    }
  }
}

// Selectively expose descriptor tags.
const publicDescriptorTags = Object.freeze({
  complexItem: itemDescriptor.complexTag,
  primitiveItem: itemDescriptor.primitiveTag,
  primitiveProperty: propertyDescriptor.primitiveTag,
  string: stringDescriptor.tag,
})

// Don't expose `setDefaultGutter()`.
const publicLineBuilder = Object.freeze({
  buffer: lineBuilder.buffer,
  first: lineBuilder.first,
  last: lineBuilder.last,
  line: lineBuilder.line,
  single: lineBuilder.single,
  actual: Object.freeze({
    buffer: lineBuilder.actual.buffer,
    first: lineBuilder.actual.first,
    last: lineBuilder.actual.last,
    line: lineBuilder.actual.line,
    single: lineBuilder.actual.single,
  }),
  expected: Object.freeze({
    buffer: lineBuilder.expected.buffer,
    first: lineBuilder.expected.first,
    last: lineBuilder.expected.last,
    line: lineBuilder.expected.line,
    single: lineBuilder.expected.single,
  }),
})

function modifyTheme (descriptor, modifier) {
  themeUtils.addModifier(descriptor, modifier)
  return descriptor
}

function add (plugin) {
  verify(plugin)

  const name = plugin.name
  if (registry.has(name)) return registry.get(name)

  const id2deserialize = new Map()
  const tag2id = new Map()
  const addDescriptor = (id, tag, deserialize) => {
    if (id2deserialize.has(id)) throw new DuplicateDescriptorIdError(id, plugin)
    if (descriptorRegistry.has(tag) || tag2id.has(tag)) throw new DuplicateDescriptorTagError(tag, plugin)

    id2deserialize.set(id, deserialize)
    tag2id.set(tag, id)
  }

  const tryDescribeValue = plugin.register({
    // Concordance makes assumptions about when AMBIGUOUS occurs. Do not expose
    // it to plugins.
    UNEQUAL: constants.UNEQUAL,
    SHALLOW_EQUAL: constants.SHALLOW_EQUAL,
    DEEP_EQUAL: constants.DEEP_EQUAL,

    ObjectValue: object.ObjectValue,
    DescribedMixin: object.DescribedMixin,
    DeserializedMixin: object.DeserializedMixin,

    addDescriptor,
    applyThemeModifiers: themeUtils.applyModifiers,
    descriptorTags: publicDescriptorTags,
    lineBuilder: publicLineBuilder,
    mapRecursor: recursorUtils.map,
    modifyTheme,
    wrapFromTheme: formatUtils.wrap,
  })

  const registered = {
    id2deserialize,
    serializerVersion: plugin.serializerVersion,
    name,
    tag2id,
    theme: plugin.theme || {},
    tryDescribeValue,
  }

  registry.set(name, registered)
  for (const tag of tag2id.keys()) {
    descriptorRegistry.set(tag, registered)
  }

  return registered
}
exports.add = add

function getDeserializers (plugins) {
  return plugins.map(plugin => {
    const registered = add(plugin)
    return {
      id2deserialize: registered.id2deserialize,
      name: registered.name,
      serializerVersion: registered.serializerVersion,
    }
  })
}
exports.getDeserializers = getDeserializers

function getThemes (plugins) {
  return plugins.map(plugin => {
    const registered = add(plugin)
    return {
      name: registered.name,
      theme: registered.theme,
    }
  })
}
exports.getThemes = getThemes

function getTryDescribeValues (plugins) {
  return plugins.map(plugin => add(plugin).tryDescribeValue)
}
exports.getTryDescribeValues = getTryDescribeValues

function resolveDescriptorRef (tag) {
  if (!descriptorRegistry.has(tag)) return null

  const registered = descriptorRegistry.get(tag)
  return {
    id: registered.tag2id.get(tag),
    name: registered.name,
    serialization: {
      serializerVersion: registered.serializerVersion,
    },
  }
}
exports.resolveDescriptorRef = resolveDescriptorRef
