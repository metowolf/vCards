/** 带自定义标签的电话号码（对应 YAML 中的 `number` + `label`） */
export interface PhoneEntry {
  number: string | number
  label: string
}

/** 带自定义标签的邮箱（对应 YAML 中的 `email` + `label`） */
export interface EmailEntry {
  email: string
  label: string
}

/** 联系电话：纯字符串/数字，或带标签的对象 */
export type Phone = string | number | PhoneEntry

/** 联系邮箱：纯字符串，或带标签的对象 */
export type Email = string | EmailEntry

/** 数据文件（data/<分类>/<机构>.yaml）中 `basic` 字段的结构 */
export interface Basic {
  organization: string
  cellPhone?: Phone[]
  url?: string
  workEmail?: Email[]
}

/** 数据文件（data/<分类>/<机构>.yaml）的顶层结构 */
export interface VCardData {
  basic: Basic
}

export const isPhoneEntry = (phone: Phone): phone is PhoneEntry =>
  typeof phone === 'object' && phone !== null && 'number' in phone

export const isEmailEntry = (email: Email): email is EmailEntry =>
  typeof email === 'object' && email !== null && 'email' in email
