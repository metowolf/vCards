import { cpSync, readdirSync, rmSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { listYamlPaths } from './core/data'
import { gitRevision } from './core/git'
import { renderVCard } from './core/vcard'
import { mapPool } from './utils/pool'

const TEMP_DIR = 'temp'
const PUBLIC_DIR = 'public'
const RADICALE_DIR = 'radicale'
const SUMMARY_DIR = join(TEMP_DIR, '汇总')

/** 并发调用 git 的上限，避免一次性创建过多子进程 */
const GIT_CONCURRENCY = 8

const sortedNames = (dir: string): string[] => readdirSync(dir).sort()

const listDirs = (dir: string): string[] =>
  sortedNames(dir).filter((name) => statSync(join(dir, name)).isDirectory())

const listVcfFiles = (dir: string): string[] =>
  sortedNames(dir).filter((name) => name.endsWith('.vcf'))

const readAll = async (paths: string[]): Promise<string> =>
  (await Promise.all(paths.map((filePath) => Bun.file(filePath).text()))).join('')

/** 渲染并写入 temp/<分类>/<名称>.vcf */
const writeVCard = async (yamlPath: string, revision?: string): Promise<void> => {
  const contents = await renderVCard(yamlPath, revision ? { carddav: { revision } } : {})
  const out = join(TEMP_DIR, basename(dirname(yamlPath)), `${basename(yamlPath, '.yaml')}.vcf`)
  await Bun.write(out, contents)
}

/** 生成 temp/<分类>/<名称>.vcf（标准版，不写入 CardDAV 元数据） */
const generator = async (): Promise<void> => {
  for (const yamlPath of listYamlPaths()) {
    await writeVCard(yamlPath)
  }
}

/** 同上，附带 CardDAV 所需的 UID 与基于 git 提交时间的 REV */
const generatorExt = async (): Promise<void> => {
  const yamlPaths = listYamlPaths()
  const revisions = await mapPool(yamlPaths, GIT_CONCURRENCY, gitRevision)

  for (const [index, yamlPath] of yamlPaths.entries()) {
    await writeVCard(yamlPath, revisions[index])
  }
}

/** temp/<分类>/*.vcf -> temp/汇总/<分类>.all.vcf */
const combine = async (): Promise<void> => {
  const categories = listDirs(TEMP_DIR).filter((name) => name !== '汇总')

  for (const category of categories) {
    const dir = join(TEMP_DIR, category)
    const files = listVcfFiles(dir).map((name) => join(dir, name))
    await Bun.write(join(SUMMARY_DIR, `${category}.all.vcf`), await readAll(files))
  }
}

/** temp/汇总/*.all.vcf -> temp/汇总/全部.vcf */
const allinone = async (): Promise<void> => {
  const files = listVcfFiles(SUMMARY_DIR)
    .filter((name) => name.endsWith('.all.vcf'))
    .map((name) => join(SUMMARY_DIR, name))

  await Bun.write(join(SUMMARY_DIR, '全部.vcf'), await readAll(files))
}

/** temp/汇总/全部.vcf -> public/汇总.vcf */
const distSummary = async (): Promise<void> => {
  await Bun.write(join(PUBLIC_DIR, '汇总.vcf'), Bun.file(join(SUMMARY_DIR, '全部.vcf')))
}

/** temp 下所有 .vcf（除汇总）打包为 public/archive.zip */
const archive = async (): Promise<void> => {
  const proc = Bun.spawn(
    ['zip', '-r', resolve(PUBLIC_DIR, 'archive.zip'), '.', '-i', '*.vcf', '-x', '汇总/*'],
    { cwd: resolve(TEMP_DIR), stdout: 'ignore', stderr: 'inherit' }
  )

  const exitCode = await proc.exited
  if (exitCode !== 0) {
    throw new Error(`zip 打包失败，退出码 ${exitCode}（请确认已安装 zip 命令）`)
  }
}

const removeDirs = (...dirs: string[]): void =>
  dirs.forEach((dir) => rmSync(dir, { recursive: true, force: true }))

const clean = (): void => removeDirs(PUBLIC_DIR, TEMP_DIR)
const cleanRadicale = (): void => removeDirs(RADICALE_DIR)

/** 为每个分类目录写入 Radicale 属性文件 */
const createRadicale = async (): Promise<void> => {
  for (const folder of listDirs(TEMP_DIR)) {
    const count = listVcfFiles(join(TEMP_DIR, folder)).length
    const props = `{"D:displayname": "${folder}(${count})", "tag": "VADDRESSBOOK"}`
    await Bun.write(join(TEMP_DIR, folder, '.Radicale.props'), props)
  }
}

/** temp/* -> radicale/ios/，iOS 按分类展示为多个通讯录 */
const distRadicale = (): void => {
  cpSync(TEMP_DIR, join(RADICALE_DIR, 'ios'), { recursive: true })
}

/** 所有 vcf 合并到 radicale/macos/全部/，macOS 只展示一个通讯录 */
const distRadicaleMacos = async (): Promise<void> => {
  const allDir = join(RADICALE_DIR, 'macos', '全部')
  let total = 0

  for (const folder of listDirs(TEMP_DIR)) {
    const dir = join(TEMP_DIR, folder)
    for (const name of listVcfFiles(dir)) {
      await Bun.write(join(allDir, name), Bun.file(join(dir, name)))
      total += 1
    }
  }

  await Bun.write(
    join(allDir, '.Radicale.props'),
    `{"D:displayname": "全部(${total})", "tag": "VADDRESSBOOK"}`
  )
}

const build = async (): Promise<void> => {
  clean()
  await generator()
  await combine()
  await allinone()
  await distSummary()
  await archive()
}

const radicale = async (): Promise<void> => {
  clean()
  await generatorExt()
  await createRadicale()
  cleanRadicale()
  distRadicale()
  await distRadicaleMacos()
}

const tasks: Record<string, () => Promise<void>> = { build, radicale }

const task = Bun.argv[2] ?? 'build'
const run = tasks[task]

if (!run) {
  console.error(`未知任务: ${task}（可选: ${Object.keys(tasks).join(', ')}）`)
  process.exit(1)
}

await run()
