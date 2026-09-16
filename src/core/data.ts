import { Glob } from 'bun'
import { load } from 'js-yaml'
import { isVCardData } from '../const/schema'
import type { VCardData } from '../const/schema'

/** 数据目录，形如 `data/<分类>/<机构>.yaml` 与同名 `.png` */
export const DATA_DIR = 'data'

/**
 * 扫描 `data/<分类>/*.yaml`，返回相对仓库根目录的路径。
 * 显式按字典序排序，保证每次构建的产物顺序一致。
 */
export const listYamlPaths = (base = DATA_DIR): string[] =>
  [...new Glob(`${base}/*/*.yaml`).scanSync('.')]
    .map((filePath) => filePath.replace(/^\.\//, ''))
    .sort()

/** 读取并解析 YAML 数据，格式不合法时直接抛错 */
export const readVCardData = async (yamlPath: string): Promise<VCardData> => {
  const file = Bun.file(yamlPath)
  if (!(await file.exists())) {
    throw new Error(`数据文件不存在: ${yamlPath}`)
  }

  const data: unknown = load(await file.text())
  if (!isVCardData(data)) {
    throw new Error(`数据格式不合法: ${yamlPath}`)
  }

  return data
}
