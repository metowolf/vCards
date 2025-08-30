interface HtmlOptions {
    /**
     * @description html 结果中每个字+拼音外层 span 标签的类名。默认为 py-result-item
     */
    resultClass?: string;
    /**
     * @description html 结果中拼音 rt 标签的类名。默认为 py-pinyin-item
     */
    pinyinClass?: string;
    /**
     * @description html 结果中汉字 span 标签的类名。默认为 py-chinese-item
     */
    chineseClass?: string;
    /**
     * @description 是否用 span 标签包装非汉字字符的结果。默认为 false。建议输入的文本为纯文本时可以设置为 true；输入文本本身为 html 富文本字符串设置为 false
     */
    wrapNonChinese?: boolean;
    /**
     * @description html 非汉字字符外层 span 标签的类名，仅当 wrapNonChinese 为 true 时生效。默认为 py-non-chinese-item
     */
    nonChineseClass?: string;
    /**
     * @description 拼音上是否标注音调
     */
    toneType?: 'symbol' | 'num' | 'none';
    /**
     * @description 对于指定的汉字及字符，在 result 上额外补充的拼音
     */
    customClassMap?: {
        [classname: string]: string[];
    };
    /**
     * @description 是否开启「一」和 「不」字的变调。默认开启。参考：https://zh.wiktionary.org/wiki/Appendix:%E2%80%9C%E4%B8%80%E2%80%9D%E5%8F%8A%E2%80%9C%E4%B8%8D%E2%80%9D%E7%9A%84%E5%8F%98%E8%B0%83
     * @value true：开启
     * @value false：不开启
     */
    toneSandhi?: boolean;
    /**
     * @description 是否保留  <rp>(</rp> 标签，默认为保留
     * @value true：保留 <rp>(</rp>
     * @value false：移除 <rp>(</rp>
     */
    rp?: boolean;
}
/**
 * @description: 获取带拼音汉字的 html 字符串
 * @param {string} text 要转换的字符串
 * @param {HtmlOptions=} options html 中标签类名相关配置
 * @return {string} 带汉字的拼音字符串
 */
export declare const html: (text: string, options?: HtmlOptions) => string;
export {};
