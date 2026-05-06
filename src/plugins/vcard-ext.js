import fs from 'fs'
import yaml from 'js-yaml'
import vCardsJS from 'vcards-js'
import {execSync} from 'child_process'
import addPhoneticField from '../utils/pinyin.js'

const plugin = (file, _, cb) => {
  const path = file.path
  const data = fs.readFileSync(path, 'utf8')
  const json = yaml.load(data)

  // 分离带标签和不带标签的电话号码
  const labeledPhones = []
  const plainPhones = []
  for (const phone of (json.basic.cellPhone || [])) {
    if (typeof phone === 'object' && phone !== null && phone.number !== undefined) {
      labeledPhones.push(phone)
    } else {
      plainPhones.push(phone)
    }
  }
  json.basic.cellPhone = plainPhones

  // 分离带标签和不带标签的邮箱
  const labeledEmails = []
  const plainEmails = []
  for (const email of (json.basic.workEmail || [])) {
    if (typeof email === 'object' && email !== null && email.email !== undefined) {
      labeledEmails.push(email)
    } else {
      plainEmails.push(email)
    }
  }
  json.basic.workEmail = plainEmails

  let vCard = vCardsJS()
  vCard.isOrganization = true
  for (const [key, value] of Object.entries(json.basic)) {
    vCard[key] = value
  }

  if (!vCard.uid){
    vCard.uid = vCard.organization
  }

  vCard.photo.embedFromFile(path.replace('.yaml', '.png'))
  let lastYamlChangeDateString = execSync(`git log -1 --pretty="format:%ci" "${path}"`).toString().trim().replace(/\s\+\d+/, '')
  let lastPngChangeDateString = execSync(`git log -1 --pretty="format:%ci" "${path.replace('yaml', 'png')}"`).toString().trim().replace(/\s\+\d+/, '')

  let rev = new Date(Math.max(new Date(lastYamlChangeDateString), new Date(lastPngChangeDateString))).toISOString()

  let formatted = vCard.getFormattedString()
  formatted = formatted.replace(/REV:[\d\-:T\.Z]+/, 'REV:' + rev)
  formatted = addPhoneticField(formatted, 'ORG')

  // 添加带标签的电话号码
  if (labeledPhones.length > 0) {
    let labeledEntries = ''
    labeledPhones.forEach((phone, i) => {
      const idx = i + 1
      labeledEntries += `item${idx}.TEL;TYPE=CELL:${phone.number}\r\n`
      labeledEntries += `item${idx}.X-ABLabel:${phone.label}\r\n`
    })
    formatted = formatted.replace('END:VCARD', labeledEntries + 'END:VCARD')
  }

  // 添加带标签的邮箱
  if (labeledEmails.length > 0) {
    let labeledEntries = ''
    labeledEmails.forEach((email, i) => {
      const idx = i + 1
      labeledEntries += `item${idx}.EMAIL;TYPE=WORK:${email.email}
`
      labeledEntries += `item${idx}.X-ABLabel:${email.label}
`
    })
    formatted = formatted.replace('END:VCARD', labeledEntries + 'END:VCARD')
  }

  file.contents = Buffer.from(formatted)
  cb(null, file)
}

export default plugin