import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { pathToFileURL } from 'url'
import plugin_vcard from './plugins/vcard.js'
import plugin_vcard_ext from './plugins/vcard-ext.js'

// 复用原插件签名：(file, _, cb)，其中 file.path 为源文件路径，结果写入 file.contents
const runPlugin = (plugin, filePath) =>
  new Promise((resolve, reject) => {
    const file = { path: filePath }
    plugin(file, null, (err, f) => (err ? reject(err) : resolve(f)))
  })

const removeDirs = (...dirs) =>
  dirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }))

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else if (entry.isFile()) fs.copyFileSync(s, d)
  }
}

// data/*/*.yaml -> temp/<category>/<name>.vcf
const generator = async () => {
  for (const filePath of getYamlPaths()) {
    const f = await runPlugin(plugin_vcard, filePath)
    const category = path.basename(path.dirname(filePath))
    const name = path.basename(filePath, '.yaml')
    const out = path.join('temp', category, `${name}.vcf`)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, f.contents)
  }
}

// data/*/*.yaml -> temp/<category>/<name>.vcf（带 REV 扩展版）
const generator_ext = async () => {
  for (const filePath of getYamlPaths()) {
    const f = await runPlugin(plugin_vcard_ext, filePath)
    const category = path.basename(path.dirname(filePath))
    const name = path.basename(filePath, '.yaml')
    const out = path.join('temp', category, `${name}.vcf`)
    fs.mkdirSync(path.dirname(out), { recursive: true })
    fs.writeFileSync(out, f.contents)
  }
}

// temp/<cat>/*.vcf -> temp/汇总/<cat>.all.vcf
const combine = () => {
  const cats = fs
    .readdirSync('temp')
    .filter((f) => fs.statSync(path.join('temp', f)).isDirectory() && f !== '汇总')
  fs.mkdirSync(path.join('temp', '汇总'), { recursive: true })
  for (const cat of cats) {
    const dir = path.join('temp', cat)
    const files = fs.readdirSync(dir).filter((x) => x.endsWith('.vcf'))
    const buf = Buffer.concat(files.map((x) => fs.readFileSync(path.join(dir, x))))
    fs.writeFileSync(path.join('temp', '汇总', `${cat}.all.vcf`), buf)
  }
}

// temp/汇总/*.all.vcf -> temp/汇总/全部.vcf
const allinone = () => {
  const dir = path.join('temp', '汇总')
  const files = fs.readdirSync(dir).filter((x) => x.endsWith('.all.vcf'))
  const buf = Buffer.concat(files.map((x) => fs.readFileSync(path.join(dir, x))))
  fs.writeFileSync(path.join(dir, '全部.vcf'), buf)
}

// temp/汇总/全部.vcf -> public/汇总.vcf
const distSummary = () => {
  fs.mkdirSync('public', { recursive: true })
  fs.copyFileSync(path.join('temp', '汇总', '全部.vcf'), path.join('public', '汇总.vcf'))
}

// temp 下所有 .vcf（除 汇总）打包为 public/archive.zip
const archive = () => {
  fs.mkdirSync('public', { recursive: true })
  execFileSync(
    'zip',
    ['-r', path.resolve('public', 'archive.zip'), '.', '-i', '*.vcf', '-x', '汇总/*'],
    { cwd: path.resolve('temp') }
  )
}

const clean = () => removeDirs('public', 'temp')
const cleanRadicale = () => removeDirs('radicale')

// 为每个分类目录写入 Radicale 属性
const createRadicale = () => {
  const folders = fs
    .readdirSync('temp')
    .filter((f) => fs.statSync(path.join('temp', f)).isDirectory())
  for (const folder of folders) {
    const count = fs
      .readdirSync(path.join('temp', folder))
      .filter((file) => file.endsWith('.vcf')).length
    fs.writeFileSync(
      path.join('temp', folder, '.Radicale.props'),
      `{"D:displayname": "${folder}(${count})", "tag": "VADDRESSBOOK"}`
    )
  }
}

const distRadicale = () => {
  fs.mkdirSync(path.join('radicale', 'ios'), { recursive: true })
  copyDir('temp', path.join('radicale', 'ios'))
}

// 所有 vcf 合并到 radicale/macos/全部/ 并生成单个 props
const distRadicaleMacos = () => {
  const allDir = './radicale/macos/全部'
  fs.mkdirSync(allDir, { recursive: true })
  let totalCount = 0

  const folders = fs
    .readdirSync('temp')
    .filter((f) => fs.statSync(path.join('temp', f)).isDirectory())
  for (const folder of folders) {
    const folderPath = path.join('temp', folder)
    const vcfFiles = fs.readdirSync(folderPath).filter((f) => f.endsWith('.vcf'))
    for (const file of vcfFiles) {
      fs.copyFileSync(path.join(folderPath, file), path.join(allDir, file))
      totalCount++
    }
  }

  fs.writeFileSync(
    path.join(allDir, '.Radicale.props'),
    `{"D:displayname": "全部(${totalCount})", "tag": "VADDRESSBOOK"}`
  )
}

const getYamlPaths = (base = 'data') => {
  const paths = []
  for (const cat of fs.readdirSync(base, { withFileTypes: true })) {
    if (!cat.isDirectory()) continue
    for (const file of fs.readdirSync(path.join(base, cat.name))) {
      if (file.endsWith('.yaml')) {
        paths.push(path.resolve(base, cat.name, file))
      }
    }
  }
  return paths
}

const build = async () => {
  clean()
  await generator()
  combine()
  allinone()
  distSummary()
  archive()
}

const radicale = async () => {
  clean()
  await generator_ext()
  createRadicale()
  cleanRadicale()
  distRadicale()
  distRadicaleMacos()
}

const tasks = { build, radicale }

const main = async () => {
  const task = process.argv[2] || 'build'
  if (!(task in tasks)) {
    console.error(`未知任务: ${task}（可选: ${Object.keys(tasks).join(', ')}）`)
    process.exit(1)
  }
  await tasks[task]()
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}

export { build, radicale }
