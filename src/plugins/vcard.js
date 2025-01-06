import fs from 'fs'
import yaml from 'js-yaml'
import vCardsJS from 'vcards-js'

const plugin = (file, _, cb) => {
  const path = file.path
  const data = fs.readFileSync(path, 'utf8')
  const json = yaml.load(data)

  let vCard = vCardsJS()
  vCard.isOrganization = true
  for (const [key, value] of Object.entries(json.basic)) {
    vCard[key] = value
  }
  // 移除 cellPhone 中 106 长号码
  if (vCard.cellPhone) {
    vCard.cellPhone = vCard.cellPhone
      .filter((phone) => {
        const phoneStr = `${phone}`
        return !phoneStr.startsWith('106') || phoneStr.length <= 11
    })
  }
  vCard.photo.embedFromFile(path.replace('.yaml', '.png'))
  file.contents = Buffer.from(vCard.getFormattedString())
  cb(null, file)
}

export default plugin
