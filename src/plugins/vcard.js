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
  vCard.photo.embedFromFile(path.replace('.yaml', '.png'))
  file.contents = Buffer.from(vCard.getFormattedString())
  cb(null, file)
}

export default plugin
