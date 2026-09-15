import { expect, test } from 'bun:test'
import { load } from 'js-yaml'
import { blockList } from './const/block'
import { schema } from './const/schema'
import { DATA_DIR, listYamlPaths } from './core/data'
import { isPhoneEntry } from './types'
import type { VCardData } from './types'
import { isPng } from './utils/isPng'
import { pngSize } from './utils/pngSize'

const yamlPaths = listYamlPaths()

/** 读取文件前 24 字节（PNG 签名 + IHDR 宽高） */
const readHead = async (filePath: string): Promise<Uint8Array> =>
  new Uint8Array(await Bun.file(filePath).slice(0, 24).arrayBuffer())

const loadYaml = async (filePath: string): Promise<VCardData> =>
  load(await Bun.file(filePath).text()) as VCardData

/** 断言取值非空，并保留调用方的错误信息 */
const required = <T>(value: T | null | undefined, message: string): T => {
  if (value === null || value === undefined) {
    throw new Error(message)
  }
  return value
}

const checkImage = async (filePath: string): Promise<void> => {
  const head = await readHead(filePath)
  if (!isPng(head)) {
    throw new Error(`${filePath} 图片格式不合法`)
  }

  const { width, height } = required(pngSize(head), `${filePath} 图片尺寸解析失败`)

  // 支持两种规格：200x200px/20KB 或 512x512px/50KB
  const is200 = width === 200 && height === 200
  const is512 = width === 512 && height === 512
  if (!is200 && !is512) {
    throw new Error(`${filePath} 图片尺寸不合法 ${width}x${height}，需要 200x200 或 512x512`)
  }

  const sizeLimit = is512 ? 1024 * 50 : 1024 * 20
  const { size } = await Bun.file(filePath).stat()
  if (size > sizeLimit) {
    throw new Error(`${filePath} 图片体积 ${(size / 1024).toFixed(1)} KB 超过限制`)
  }
}

const checkVCard = async (filePath: string): Promise<void> => {
  const data = await loadYaml(filePath)

  const result = schema.safeParse(data)
  if (!result.success) {
    const message = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ')
    throw new Error(`${filePath} schema 校验失败 ${message}, ${JSON.stringify(data)}`)
  }

  for (const block of blockList) {
    if (block.organization === data.basic.organization) {
      throw new Error(`${filePath} 不收录 ${block.organization}，原因：${block.reason}`)
    }
  }
}

test('Validation/no-duplicate-phones', async () => {
  const phoneMap = new Map<string, string>()
  const duplicates: string[] = []

  for (const filePath of yamlPaths) {
    const data = await loadYaml(filePath)

    for (const phone of data.basic.cellPhone ?? []) {
      const normalized = String(isPhoneEntry(phone) ? phone.number : phone).replace(/\D/g, '')
      const seen = phoneMap.get(normalized)

      if (seen) {
        duplicates.push(`${normalized}: ${seen} 和 ${filePath}`)
      } else {
        phoneMap.set(normalized, filePath)
      }
    }
  }

  expect(duplicates).toEqual([])
})

for (const yamlPath of yamlPaths) {
  const segments = yamlPath.split('/')
  const type = required(segments[1], `数据路径不合法: ${yamlPath}`)
  const name = required(segments[2], `数据路径不合法: ${yamlPath}`).replace(/\.yaml$/, '')

  test(`Image/${type}/${name}`, () => checkImage(`${DATA_DIR}/${type}/${name}.png`))
  test(`vCard/${type}/${name}`, () => checkVCard(yamlPath))
}
