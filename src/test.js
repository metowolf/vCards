import fs from 'fs'
import path from 'path'
import test from 'ava'
import { load } from 'js-yaml'
import { readChunkSync } from 'read-chunk'
import prettyBytes from 'pretty-bytes'
import isPng from './utils/isPng.js'
import pngSize from './utils/pngSize.js'
import blockList from './const/block.js'
import schema from './const/schema.js'

const checkImage = (t, filePath) => {
  const buffer = readChunkSync(filePath, {
    startPosition: 0,
    length: 24
  })
  if (!isPng(buffer)) {
    t.fail('图片格式不合法')
  }
  const dimensions = pngSize(buffer)
  if (!dimensions) {
    t.fail('图片尺寸解析失败')
    return
  }
  const lstat = fs.lstatSync(filePath)

  // 支持两种规格：200x200px/20KB 或 512x512px/50KB
  const is200 = dimensions.width === 200 && dimensions.height === 200
  const is512 = dimensions.width === 512 && dimensions.height === 512

  if (!is200 && !is512) {
    t.fail(`图片尺寸不合法 ${dimensions.width}x${dimensions.height}，需要 200x200 或 512x512`)
  }

  const sizeLimit = is512 ? 1024 * 50 : 1024 * 20
  if (lstat.size > sizeLimit) {
    t.fail(`图片文件体积超过限制 ${prettyBytes(lstat.size)}`)
  }
  t.pass()
}

const checkVCard = (t, filePath) => {
  const data = fs.readFileSync(filePath, 'utf8')
  const json = load(data)

  // 检查 schema
  const result = schema.safeParse(json)
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    t.fail(`schema 校验失败 ${message}, ${JSON.stringify(json)}`)
  }

  for (const block of blockList) {
    if (block.organization === json.basic.organization) {
      t.fail(`不收录 ${block.organization}，原因：${block.reason}`)
    }
  }

  t.pass()
}

const getYamlPaths = () => {
  const base = 'data'
  const categories = fs.readdirSync(base, { withFileTypes: true })
  const paths = []
  for (const cat of categories) {
    if (!cat.isDirectory()) continue
    const files = fs.readdirSync(path.join(base, cat.name))
    for (const file of files) {
      if (file.endsWith('.yaml')) {
        paths.push(path.join(base, cat.name, file))
      }
    }
  }
  return paths
}

const yamlPaths = getYamlPaths()

test('Validation/no-duplicate-phones', t => {
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

  t.is(
    duplicates.length,
    0,
    `发现重复电话号码:\n${duplicates.join('\n')}`
  )
})

for (const filePath of yamlPaths) {
  const type = filePath.split('/')[1]
  const name = filePath.split('/')[2].split('.')[0]
  test(`Image/${type}/${name}`, checkImage, `data/${type}/${name}.png`)
  test(`vCard/${type}/${name}`, checkVCard, `data/${type}/${name}.yaml`)
}
