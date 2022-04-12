import fs from 'fs'
import yaml from 'js-yaml'
import vCardsJS from 'vcards-js'
import {execSync} from 'child_process'

const plugin = (file, _, cb) => {
  const path = file.path
  const data = fs.readFileSync(path, 'utf8')
  const json = yaml.load(data)

  let vCard = vCardsJS()
  vCard.isOrganization = true
  for (const [key, value] of Object.entries(json.basic)) {
    vCard[key] = value
  }

  if (!vCard.uid){
    vCard.uid = vCard.organization
  }
  
  vCard.photo.embedFromFile(path.replace('.yaml', '.png'))
  let lastYamlChangeDateString = execSync('git log -1 --pretty="format:%ci" ' + path).toString().trim().replace(/\s\+\d+/, '')
  let lastPngChangeDateString = execSync('git log -1 --pretty="format:%ci" ' + path.replace('.yaml', '.png')).toString().trim().replace(/\s\+\d+/, '')

  let rev = new Date(Math.max(new Date(lastYamlChangeDateString), new Date(lastPngChangeDateString))).toISOString()
  
  formatted = vCard.getFormattedString()
  formatted = formatted.replace(/REV:[\d\-:T\.Z]+/, 'REV:' + rev)
  file.contents = Buffer.from(formatted)
  cb(null, file)
}

export default plugin