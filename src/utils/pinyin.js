import { pinyin } from 'pinyin-pro'

const addPhoneticField = (text, fieldName) => {
  const regex = new RegExp(`${fieldName};CHARSET=UTF-8:(.*)\r?\n`, 'g');
  return text.replace(regex, (match, value) => {
    const hasChinese = /[\u4e00-\u9fa5]/.test(value);
    const pinyinText = hasChinese ?
      pinyin(value, { toneType: 'none', nonZh: 'consecutive', type: 'array' })
        .map(item => item[0].toUpperCase() + item.slice(1))
        .join(' ')
      : value;
    return `${match}X-PHONETIC-${fieldName};CHARSET=UTF-8:${pinyinText}\n`;
  });
};

export default addPhoneticField;