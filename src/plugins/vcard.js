import fs from 'fs'
import yaml from 'js-yaml'
import vCardsJS from 'vcards-js'
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
  // 移除 cellPhone 中 106 长号码
  if (vCard.cellPhone) {
    vCard.cellPhone = vCard.cellPhone
      .filter((phone) => {
        const phoneStr = `${phone}`
        return !phoneStr.startsWith('106') || phoneStr.length <= 11
    })
  }
  vCard.photo.embedFromFile(path.replace('.yaml', '.png'))
  let formatted = vCard.getFormattedString()
  formatted = addPhoneticField(formatted, 'ORG')

  // 添加带标签的电话号码
  const filteredLabeled = labeledPhones.filter((phone) => {
    const phoneStr = `${phone.number}`
    return !phoneStr.startsWith('106') || phoneStr.length <= 11
  })
  if (filteredLabeled.length > 0) {
    let labeledEntries = ''
    filteredLabeled.forEach((phone, i) => {
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
