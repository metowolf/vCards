interface MatchOptions {
    /**
     * @description 每个汉字和拼音需要遵从的匹配精度
     */
    precision?: "first" | "start" | "every" | "any";
    /**
     * @description 匹配的汉字下标是否为连续的才算匹配成功
     */
    continuous?: boolean;
    /**
     * @description 匹配时对于空格的处理
     */
    space?: "ignore" | "preserve";
    /**
     * @description 最后一个字的匹配精度
     */
    lastPrecision?: "first" | "start" | "every" | "any";
    /**
     * @description 是否大小写不敏感
     */
    insensitive?: boolean;
    /**
     * @description 是否将 ü 替换成 v 进行匹配
     */
    v?: boolean;
}
/**
 * @description: 检测汉语字符串和拼音是否匹配
 * @param {string} text 汉语字符串
 * @param {string} pinyin 拼音，支持各种缩写形式
 * @param {MatchOptions=} options 配置项
 * @return {Array | null} 若匹配成功，返回 text 中匹配成功的下标数组；若匹配失败，返回 null
 */
export declare const match: (text: string, pinyin: string, options?: MatchOptions) => number[] | null;
export {};
