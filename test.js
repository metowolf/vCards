const fs = require('fs')
const chalk = require('chalk')
const glob = require("glob").sync
const readChunk = require('read-chunk')
const isPng = require('is-png')
const imageSize = require('image-size')
const prettyBytes = require('pretty-bytes')
const yaml = require('js-yaml')

const check = (type, name) => {

  const pathname = `data/${type}/${name}`

  if (!fs.existsSync(`${pathname}.png`)) {
    return chalk.red('(缺少对应 PNG 图像)')
  }

  const lstat = fs.lstatSync(`${pathname}.png`)
  if (!lstat.isFile()) {
    return chalk.red('(PNG 图像非标准文件)')
  }

  const buffer = readChunk.sync(`${pathname}.png`, 0, 8)
  if (!isPng(buffer)) {
    return chalk.red('(PNG 图像格式不合法)')
  }

  if (lstat.size > 1024 * 20) {
    return `${chalk.red(`(PNG 图像超出大小限制 ${prettyBytes(lstat.size)} > 20 kB)`)}`
  }

  dimensions = imageSize(`${pathname}.png`)
  if (dimensions.width !== 200 || dimensions.height !== 200) {
    return `${chalk.red(`(PNG 图像尺寸不符合规范 ${dimensions.width}w${dimensions.height}h)`)}`
  }

  const data = fs.readFileSync(`${pathname}.yaml`, 'utf8')
  const json = yaml.load(data)

  for (let phone of json.basic.cellPhone) {
    if (phone.toString().substr(0, 3) === '106') {
      return chalk.red('(存在 106 短信通道号码)')
    }
  }

  return true
}

let files = glob('data/*/*.yaml')
console.log(`\n当前目录下发现 ${chalk.green(files.length)} 个联系人信息\n`)

for (let [index, file] of files.entries()) {
  const type = file.split('/')[1]
  const name = file.split('/')[2].split('.')[0]
  const result = check(type, name)
  if (result !== true) {
    console.log(` ${index + 1}\t${type}-${name} ${result}`)
    console.log()
    process.exit(1)
  } else {
    console.log(` ${index + 1}\t${type}-${name}`)
  }
}

console.log()
