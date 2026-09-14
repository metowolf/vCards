import { pinyin } from 'pinyin-pro'

// RFC 2426 要求内容行不超过 75 字节，超长部分以 CRLF + 空格折行
const foldLine = (line) => {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line
  const parts = []
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
};

const addPhoneticField = (text, fieldName) => {
  // vcards-js 2.11+ 不再为 vCard 3.0 输出 CHARSET 参数，此处两种形式都兼容
  const regex = new RegExp(`^${fieldName}(?:;CHARSET=UTF-8)?:(.*)\r?\n`, 'gm');
  return text.replace(regex, (match, value) => {
    const hasChinese = /[\u4e00-\u9fa5]/.test(value);
    const pinyinText = hasChinese ?
      pinyin(value, { toneType: 'none', nonZh: 'consecutive', type: 'array' })
        .map(item => item[0].toUpperCase() + item.slice(1))
        .join(' ')
      : value;
    return `${match}${foldLine(`X-PHONETIC-${fieldName};CHARSET=UTF-8:${pinyinText}`)}\r\n`;
  });
};

export default addPhoneticField;