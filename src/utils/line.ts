import type { EmailEntry, PhoneEntry } from '../const/schema'
import { getPhoneticValue } from './pinyin'

const encoder = new TextEncoder()

// RFC 2426 要求内容行不超过 75 字节，超长部分以 CRLF + 空格折行
const foldLine = (line: string): string => {
  if (encoder.encode(line).length <= 75) return line

  const parts: string[] = []
  let current = ''
  let limit = 75 // 续行需要额外的折行空格，故折行后上限为 74 字节
  for (const char of line) {
    if (encoder.encode(current + char).length > limit) {
      parts.push(current)
      current = char
      limit = 74
    } else {
      current += char
    }
  }
  parts.push(current)
  return parts.join('\r\n ')
}

// 将一行插入 END:VCARD 之前并补行尾 CRLF；空行跳过追加，原样返回
const appendLine = (text: string, line: string): string =>
  line ? text.replace('END:VCARD', `${line}\r\nEND:VCARD`) : text

// 追加带 itemN 分组与 X-ABLabel 的号码/邮箱行，行内按 RFC 2426 折行
export const appendABLabel = (
  text: string,
  entries: Array<PhoneEntry | EmailEntry>,
  type: 'TEL;TYPE=CELL' | 'EMAIL;TYPE=WORK'
): string => {
  let result = text
  for (const [index, entry] of entries.entries()) {
    const value = 'number' in entry ? entry.number : entry.email
    const group = index + 1
    const valueLine = foldLine(`item${group}.${type}:${value}`)
    const labelLine = foldLine(`item${group}.X-ABLabel:${entry.label}`)
    result = appendLine(result, valueLine)
    result = appendLine(result, labelLine)
  }
  return result
}

// 为指定字段追加 X-PHONETIC-* 拼音行，便于通讯录按拼音排序
export const appendPhonetic = (text: string, fieldName: string, value: string): string => {
  const phoneticValue = getPhoneticValue(value)
  const phoneticLine = foldLine(`X-PHONETIC-${fieldName}:${phoneticValue}`)
  const result = appendLine(text, phoneticLine)
  return result
}
