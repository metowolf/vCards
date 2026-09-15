import vCardsJS from 'vcards-js'
import { isEmailEntry, isPhoneEntry } from '../types'
import type { EmailEntry, PhoneEntry } from '../types'
import { addPhoneticField } from '../utils/pinyin'
import { readVCardData } from './data'

export interface RenderOptions {
  /**
   * CardDAV 模式：补充稳定的 UID 与基于 git 提交时间的 REV，
   * 便于客户端识别联系人的增量更新（对应原来的 vcard-ext 插件）。
   */
  carddav?: { revision: string }
}

// iOS 通过 X-ABLabel 展示自定义标签，需要 itemN 分组前缀
const renderLabeled = (
  entries: Array<PhoneEntry | EmailEntry>,
  type: 'TEL;TYPE=CELL' | 'EMAIL;TYPE=WORK'
): string =>
  entries
    .map((entry, index) => {
      const value = 'number' in entry ? entry.number : entry.email
      return `item${index + 1}.${type}:${value}\r\nitem${index + 1}.X-ABLabel:${entry.label}\r\n`
    })
    .join('')

/** 将单个 YAML 数据渲染为 vCard 3.0 文本 */
export const renderVCard = async (
  yamlPath: string,
  options: RenderOptions = {}
): Promise<string> => {
  const { basic } = await readVCardData(yamlPath)
  const { carddav } = options

  const labeledPhones = (basic.cellPhone ?? []).filter(isPhoneEntry)
  const labeledEmails = (basic.workEmail ?? []).filter(isEmailEntry)

  const vcard = vCardsJS()
  vcard.isOrganization = true

  // 字段名与 vcards-js 的 setter 同名，按 YAML 中的键顺序赋值；带标签的条目单独拼接
  const fields: Record<string, unknown> = {
    ...basic,
    cellPhone: (basic.cellPhone ?? []).filter((phone) => !isPhoneEntry(phone)),
    workEmail: (basic.workEmail ?? []).filter((email) => !isEmailEntry(email))
  }
  const setters = vcard as unknown as Record<string, unknown>
  for (const [key, value] of Object.entries(fields)) {
    setters[key] = value
  }

  if (carddav && !vcard.uid) {
    vcard.uid = vcard.organization
  }

  vcard.photo.embedFromFile(yamlPath.replace(/\.yaml$/, '.png'))

  let formatted = vcard.getFormattedString()

  if (carddav) {
    formatted = formatted.replace(/REV:[\d\-:T\.Z]+/, `REV:${carddav.revision}`)
  }

  // 为中文机构名补充拼音字段，便于通讯录排序
  formatted = addPhoneticField(formatted, 'ORG')

  const labeled =
    renderLabeled(labeledPhones, 'TEL;TYPE=CELL') + renderLabeled(labeledEmails, 'EMAIL;TYPE=WORK')
  if (labeled) {
    formatted = formatted.replace('END:VCARD', labeled + 'END:VCARD')
  }

  return formatted
}
