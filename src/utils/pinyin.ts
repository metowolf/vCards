import { pinyin } from 'pinyin-pro'

// 纯转换：含中文 → 首字母大写、空格分隔的拼音；不含中文 → 原样返回
export const getPhoneticValue = (value: string): string => {
  const hasChinese = /[\u4e00-\u9fa5]/.test(value)
  const phonetic = hasChinese
    ? pinyin(value, { toneType: 'none', nonZh: 'consecutive', type: 'array' })
        .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
        .join(' ')
    : value
  return phonetic
}
