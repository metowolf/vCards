import { BasicOptions } from "../pinyin";
import { Output, OutputFormat } from "./middlewares";
type SegmentBaseOptions = Pick<BasicOptions, "toneType" | "mode" | "surname" | "nonZh" | "v" | "toneSandhi" | "segmentit">;
interface AllSegmentReturnOptions extends SegmentBaseOptions {
    /**
     * @description 以片段格式返回全部信息
     */
    format?: OutputFormat.AllSegment;
}
interface AllArrayReturnOptions extends SegmentBaseOptions {
    /**
     * @description 以数组格式返回全部信息
     */
    format?: OutputFormat.AllArray;
}
interface AllStringReturnOptions extends SegmentBaseOptions {
    /**
     * @description 以字符串格式返回全部信息
     */
    format?: OutputFormat.AllString;
    /**
     * @description 分隔符，默认为空格，仅在 format 为 AllString(3)、PinyinString(6)、ZhString(9) 时生效
     */
    separator?: string;
}
interface PinyinSegmentReturnOptions extends SegmentBaseOptions {
    /**
     * @description 以片段格式返回拼音
     */
    format?: OutputFormat.PinyinSegment;
}
interface PinyinArrayReturnOptions extends SegmentBaseOptions {
    /**
     * @description 以数组格式返回拼音
     */
    format?: OutputFormat.PinyinArray;
}
interface PinyinStringReturnOptions extends SegmentBaseOptions {
    /**
     * @description 以字符串格式返回拼音
     */
    format?: OutputFormat.PinyinString;
    /**
     * @description 分隔符，默认为空格，仅在 format 为 AllString(3)、PinyinString(6)、ZhString(9) 时生效
     */
    separator?: string;
}
interface ZhSegmentReturnOptions extends SegmentBaseOptions {
    /**
     * @description 以片段格式返回中文
     */
    format?: OutputFormat.ZhSegment;
}
interface ZhArrayReturnOptions extends SegmentBaseOptions {
    /**
     * @description 以数组格式返回中文
     */
    format?: OutputFormat.ZhArray;
}
interface ZhStringReturnOptions extends SegmentBaseOptions {
    /**
     * @description 以字符串格式返回中文
     */
    format?: OutputFormat.ZhString;
    /**
     * @description 分隔符，默认为空格，仅在 format 为 AllString(3)、PinyinString(6)、ZhString(9) 时生效
     */
    separator?: string;
}
export interface SegmentCompleteOptions extends SegmentBaseOptions {
    format?: OutputFormat;
    /**
     * @description 分隔符，默认为空格，仅在 format 为 AllString(3)、PinyinString(6)、ZhString(9) 时生效
     */
    separator?: string;
}
export declare function segment(word: string, options?: AllSegmentReturnOptions): Output['AllSegment'];
export declare function segment(word: string, options?: AllArrayReturnOptions): Output['AllArray'];
export declare function segment(word: string, options?: AllStringReturnOptions): Output['AllString'];
export declare function segment(word: string, options?: PinyinSegmentReturnOptions): Output['PinyinSegment'];
export declare function segment(word: string, options?: PinyinArrayReturnOptions): Output['PinyinArray'];
export declare function segment(word: string, options?: PinyinStringReturnOptions): Output['PinyinString'];
export declare function segment(word: string, options?: ZhSegmentReturnOptions): Output['ZhSegment'];
export declare function segment(word: string, options?: ZhArrayReturnOptions): Output['ZhArray'];
export declare function segment(word: string, options?: ZhStringReturnOptions): Output['ZhString'];
export { OutputFormat };
