const fs = require('fs')
const glob = require("glob").sync
const yaml = require('js-yaml')
const vCardsJS = require('vcards-js')

const make = (type, name) => {

  let data = fs.readFileSync(`data/${type}/${name}.yaml`, 'utf8')
  let json = yaml.load(data)

  let vCard = vCardsJS()
  vCard.isOrganization = true
  for (let [key, value] of Object.entries(json.basic)) {
    vCard[key] = value
  }
  vCard.photo.embedFromFile(`data/${type}/${name}.png`)

  if (!fs.existsSync(`vcf/${type}`)) {
    fs.mkdirSync(`vcf/${type}`)
  }
  vCard.saveToFile(`vcf/${type}/${name}.vcf`)
}

if (!fs.existsSync('vcf')) {
  fs.mkdirSync('vcf')
}

let files = glob('data/*/*.yaml')
for (let file of files) {
  let type = file.split('/')[1]
  let name = file.split('/')[2].split('.')[0]
  make(type, name)
}
