import type { SingleWordResult } from '../../common/type';
interface BasicOptions {
    /**
     * @description 返回的拼音音调类型
     * @value symbol：在字母上加音调 （默认值）
     * @value num：以数字格式展示音调，并跟在拼音后面
     * @value none：不展示音调
     */
    toneType?: 'symbol' | 'num' | 'none';
    /**
     * @description 返回的拼音格式类型
     * @value pinyin：返回完整拼音 （默认值）
     * @value initial：返回声母
     * @value final：返回韵母
     * @value num：返回音调对应的数字
     * @value first：返回首字母
     * @value finalHead：返回韵头（介音）
     * @value finalBody：返回韵腹
     * @value finalTail：返回韵尾
     */
    pattern?: 'pinyin' | 'initial' | 'final' | 'num' | 'first' | 'finalHead' | 'finalBody' | 'finalTail';
    /**
     * @description 对于 ü 的返回是否转换成 v（仅在 toneType: none 启用时生效）
     * @value false：返回值中保留 ü （默认值）
     * @value true：返回值中 ü 转换成 v
     */
    v?: boolean;
    /**
     * @description 非汉字字符的间距格式
     * @value spaced：连续非汉字字符之间用空格隔开 （默认值）
     * @value consecutive：连续非汉字字符无间距
     * @value removed：返回结果移除非汉字字符
     */
    nonZh?: 'spaced' | 'consecutive' | 'removed';
}
interface AllData {
    origin: string;
    pinyin: string;
    initial: string;
    final: string;
    num: number;
    first: string;
    finalHead: string;
    finalBody: string;
    finalTail: string;
    isZh: boolean;
    inZhRange: boolean;
}
interface OptionsReturnString extends BasicOptions {
    /**
     * @description 返回结果的格式
     * @value string：以字符串格式返回，拼音之间用空格隔开 （默认值）
     * @value array：以数组格式返回
     * @value array: 返回全部信息数组
     */
    type?: 'string';
}
interface OptionsReturnArray extends BasicOptions {
    /**
     * @description 返回结果的格式
     * @value string：以字符串格式返回，拼音之间用空格隔开 （默认值）
     * @value array：以数组格式返回
     * @value array: 返回全部信息数组
     */
    type: 'array';
}
interface OptionsReturnAll extends BasicOptions {
    /**
     * @description 返回结果的格式
     * @value string：以字符串格式返回，拼音之间用空格隔开 （默认值）
     * @value array：以数组格式返回
     * @value array: 返回全部信息数组
     */
    type: 'all';
}
export interface CompleteOptions extends BasicOptions {
    /**
     * @description 返回结果的格式
     * @value string：以字符串格式返回，拼音之间用空格隔开 （默认值）
     * @value array：以数组格式返回
     * @value array: 返回全部信息数组
     */
    type?: 'string' | 'array' | 'all';
}
/**
 * @description: 获取每个汉字的所有读音
 * @param {string} text 要转换的汉语字符串
 * @param {OptionsReturnString=} options 配置项
 * @return {string[] | string[][] | AllData[][]} options.type 为 string 时，返回字符串数组，中间用空格隔开；为 array 时，返回二维拼音字符串数组；为 all 时返回二维全部信息的数组
 */
declare function polyphonic(text: string, options?: OptionsReturnString): string[];
/**
 * @description: 获取每个汉字的所有读音
 * @param {string} text 要转换的汉语字符串
 * @param {OptionsReturnArray=} options 配置项
 * @return {string[] | string[][] | AllData[][]} options.type 为 string 时，返回字符串数组，中间用空格隔开；为 array 时，返回二维拼音字符串数组；为 all 时返回二维全部信息的数组
 */
declare function polyphonic(text: string, options?: OptionsReturnArray): string[][];
/**
 * @description: 获取每个汉字的所有读音
 * @param {string} text 要转换的汉语字符串
 * @param {OptionsReturnAll=} options 配置项
 * @return {string[] | string[][] | AllData[][]} options.type 为 string 时，返回字符串数组，中间用空格隔开；为 array 时，返回二维拼音字符串数组；为 all 时返回二维全部信息的数组
 */
declare function polyphonic(text: string, options?: OptionsReturnAll): AllData[][];
export declare const handleType: (list: SingleWordResult[], options: CompleteOptions) => string | string[] | {
    origin: string;
    pinyin: string;
    initial: string;
    final: string;
    first: string;
    finalHead: string;
    finalBody: string;
    finalTail: string;
    num: number;
    isZh: boolean;
    inZhRange: boolean;
}[];
export { polyphonic };
