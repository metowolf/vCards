'use strict'

const cloneDeep = require('lodash/cloneDeep')
const merge = require('lodash/merge')

const pluginRegistry = require('./pluginRegistry')

function freezeTheme (theme) {
  const queue = [theme]
  while (queue.length > 0) {
    const object = queue.shift()
    Object.freeze(object)

    for (const key of Object.keys(object)) {
      const value = object[key]
      if (value !== null && typeof value === 'object') {
        queue.push(value)
      }
    }
  }

  return theme
}

const defaultTheme = freezeTheme({
  bigInt: { open: '', close: '' },
  boolean: { open: '', close: '' },
  circular: '[Circular]',
  date: {
    invalid: 'invalid',
    value: { open: '', close: '' },
  },
  diffGutters: {
    actual: '- ',
    expected: '+ ',
    padding: '  ',
  },
  error: {
    ctor: { open: '(', close: ')' },
    name: { open: '', close: '' },
  },
  function: {
    name: { open: '', close: '' },
    stringTag: { open: '', close: '' },
  },
  global: { open: '', close: '' },
  item: {
    after: ',',
    customFormat: null,
    increaseValueIndent: false,
  },
  list: { openBracket: '[', closeBracket: ']' },
  mapEntry: {
    after: ',',
    separator: ' => ',
  },
  maxDepth: '…',
  null: { open: '', close: '' },
  number: { open: '', close: '' },
  object: {
    openBracket: '{',
    closeBracket: '}',
    ctor: { open: '', close: '' },
    stringTag: { open: '@', close: '' },
    secondaryStringTag: { open: '@', close: '' },
  },
  property: {
    after: ',',
    customFormat: null,
    keyBracket: { open: '[', close: ']' },
    separator: ': ',
    increaseValueIndent: false,
  },
  regexp: {
    source: { open: '/', close: '/' },
    flags: { open: '', close: '' },
    separator: '---',
  },
  stats: { separator: '---' },
  string: {
    open: '',
    close: '',
    line: { open: "'", close: "'", escapeQuote: "'" },
    multiline: { start: '`', end: '`', escapeQuote: '`' },
    controlPicture: { open: '', close: '' },
    diff: {
      insert: { open: '', close: '' },
      delete: { open: '', close: '' },
      equal: { open: '', close: '' },
      insertLine: { open: '', close: '' },
      deleteLine: { open: '', close: '' },
    },
  },
  symbol: { open: '', close: '' },
  typedArray: {
    bytes: { open: '', close: '' },
  },
  undefined: { open: '', close: '' },
})

const pluginRefs = new Map()
pluginRefs.count = 0
const normalizedPluginThemes = new Map()
function normalizePlugins (plugins) {
  if (!Array.isArray(plugins) || plugins.length === 0) return null

  const refs = []
  const themes = []
  for (const fromPlugin of pluginRegistry.getThemes(plugins)) {
    if (!pluginRefs.has(fromPlugin.name)) {
      pluginRefs.set(fromPlugin.name, pluginRefs.count++)
    }

    refs.push(pluginRefs.get(fromPlugin.name))
    themes.push(fromPlugin.theme)
  }

  const ref = refs.join('.')
  if (normalizedPluginThemes.has(ref)) {
    return {
      ref,
      theme: normalizedPluginThemes.get(ref),
    }
  }

  const theme = freezeTheme(themes.reduce((acc, pluginTheme) => {
    return merge(acc, pluginTheme)
  }, cloneDeep(defaultTheme)))
  normalizedPluginThemes.set(ref, theme)
  return { ref, theme }
}

const normalizedCache = new WeakMap()
function normalize (options) {
  options = Object.assign({ plugins: [], theme: null }, options)

  const normalizedPlugins = normalizePlugins(options.plugins)
  if (!options.theme) {
    return normalizedPlugins ? normalizedPlugins.theme : defaultTheme
  }

  const entry = normalizedCache.get(options.theme) || { theme: null, withPlugins: new Map() }
  if (!normalizedCache.has(options.theme)) normalizedCache.set(options.theme, entry)

  if (normalizedPlugins) {
    if (entry.withPlugins.has(normalizedPlugins.ref)) {
      return entry.withPlugins.get(normalizedPlugins.ref)
    }

    const theme = freezeTheme(merge(cloneDeep(normalizedPlugins.theme), options.theme))
    entry.withPlugins.set(normalizedPlugins.ref, theme)
    return theme
  }

  if (!entry.theme) {
    entry.theme = freezeTheme(merge(cloneDeep(defaultTheme), options.theme))
  }
  return entry.theme
}
exports.normalize = normalize

const modifiers = new WeakMap()
function addModifier (descriptor, modifier) {
  if (modifiers.has(descriptor)) {
    modifiers.get(descriptor).add(modifier)
  } else {
    modifiers.set(descriptor, new Set([modifier]))
  }
}
exports.addModifier = addModifier

const modifierCache = new WeakMap()
const originalCache = new WeakMap()
function applyModifiers (descriptor, theme) {
  if (!modifiers.has(descriptor)) return theme

  return Array.from(modifiers.get(descriptor)).reduce((prev, modifier) => {
    const cache = modifierCache.get(modifier) || new WeakMap()
    if (!modifierCache.has(modifier)) modifierCache.set(modifier, cache)

    if (cache.has(prev)) return cache.get(prev)

    const modifiedTheme = cloneDeep(prev)
    modifier(modifiedTheme)
    freezeTheme(modifiedTheme)
    cache.set(prev, modifiedTheme)
    originalCache.set(modifiedTheme, theme)
    return modifiedTheme
  }, theme)
}
exports.applyModifiers = applyModifiers

function applyModifiersToOriginal (descriptor, theme) {
  return applyModifiers(descriptor, originalCache.get(theme) || theme)
}
exports.applyModifiersToOriginal = applyModifiersToOriginal
