import fs from 'fs'
import path from 'path'
import { test } from 'node:test'
import assert from 'node:assert'
import { load } from 'js-yaml'
import isPng from './utils/isPng.js'
import pngSize from './utils/pngSize.js'
import blockList from './const/block.js'
import schema from './const/schema.js'

// 读取文件前 24 字节
const readHead = (filePath, length) => {
  const fd = fs.openSync(filePath, 'r')
  try {
    const buffer = Buffer.alloc(length)
    const n = fs.readSync(fd, buffer, 0, length, 0)
    return buffer.subarray(0, n)
  } finally {
    fs.closeSync(fd)
  }
}

const checkImage = (filePath) => {
  const buffer = readHead(filePath, 24)
  assert.ok(isPng(buffer), '图片格式不合法')
  const dimensions = pngSize(buffer)
  assert.ok(dimensions, '图片尺寸解析失败')

  // 支持两种规格：200x200px/20KB 或 512x512px/50KB
  const is200 = dimensions.width === 200 && dimensions.height === 200
  const is512 = dimensions.width === 512 && dimensions.height === 512
  assert.ok(
    is200 || is512,
    `图片尺寸不合法 ${dimensions.width}x${dimensions.height}，需要 200x200 或 512x512`
  )

  const lstat = fs.lstatSync(filePath)
  const sizeLimit = is512 ? 1024 * 50 : 1024 * 20
  assert.ok(
    lstat.size <= sizeLimit,
    `图片文件体积超过限制 ${(lstat.size / 1024).toFixed(1)} KB`
  )
}

const checkVCard = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8')
  const json = load(data)

  // 检查 schema
  const result = schema.safeParse(json)
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    assert.fail(`schema 校验失败 ${message}, ${JSON.stringify(json)}`)
  }

  for (const block of blockList) {
    assert.notStrictEqual(
      block.organization,
      json.basic.organization,
      `不收录 ${block.organization}，原因：${block.reason}`
    )
  }
}

const getYamlPaths = () => {
  const base = 'data'
  const paths = []
  for (const cat of fs.readdirSync(base, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue
    for (const file of fs.readdirSync(path.join(base, cat.name))) {
      if (file.endsWith('.yaml')) {
        paths.push(path.join(base, cat.name, file))
      }
    }
  }
  return paths
}

const yamlPaths = getYamlPaths()

test('Validation/no-duplicate-phones', () => {
  const phoneMap = new Map()
  const duplicates = []

  for (const filePath of yamlPaths) {
    const data = fs.readFileSync(filePath, 'utf8')
    const json = load(data)
    const phones = json?.basic?.cellPhone ?? []

    for (const phone of phones) {
      const phoneStr = typeof phone === 'object' ? phone.number : phone
      const normalized = String(phoneStr).replace(/\D/g, '')
      if (phoneMap.has(normalized)) {
        duplicates.push(`${normalized}: ${phoneMap.get(normalized)} 和 ${filePath}`)
      } else {
        phoneMap.set(normalized, filePath)
      }
    }
  }

  assert.strictEqual(
    duplicates.length,
    0,
    `发现重复电话号码:\n${duplicates.join('\n')}`
  )
})

for (const filePath of yamlPaths) {
  const type = filePath.split('/')[1]
  const name = filePath.split('/')[2].split('.')[0]
  test(`Image/${type}/${name}`, () => checkImage(`data/${type}/${name}.png`))
  test(`vCard/${type}/${name}`, () => checkVCard(`data/${type}/${name}.yaml`))
}
