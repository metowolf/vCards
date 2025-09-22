import { MatchPattern } from "../../common/segmentit";
import { SingleWordResult } from "../../common/type";
interface OriginSegment {
    segment: {
        origin: string;
        result: string;
    }[];
    isZh: boolean;
}
export declare enum OutputFormat {
    AllSegment = 1,
    AllArray = 2,
    AllString = 3,
    PinyinSegment = 4,
    PinyinArray = 5,
    PinyinString = 6,
    ZhSegment = 7,
    ZhArray = 8,
    ZhString = 9
}
export interface Output {
    AllSegment: {
        origin: string;
        result: string;
    }[];
    AllArray: {
        origin: string;
        result: string;
    }[][];
    AllString: {
        origin: string;
        result: string;
    };
    PinyinSegment: string[];
    PinyinArray: string[][];
    PinyinString: string;
    ZhSegment: string[];
    ZhArray: string[][];
    ZhString: string;
}
export declare function middlewareSegment(list: SingleWordResult[], matches: MatchPattern[]): OriginSegment[];
export declare function middlewareOutputFormat(segments: OriginSegment[], options: {
    format?: OutputFormat;
    separator?: string;
}): string | string[] | string[][] | {
    origin: string;
    result: string;
}[] | {
    origin: string;
    result: string;
}[][] | {
    origin: string;
    result: string;
} | undefined;
export {};
