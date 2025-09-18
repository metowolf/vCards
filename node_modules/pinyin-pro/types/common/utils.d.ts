export declare function stringLength(text: string): number;
export declare function splitString(text: string): string[];
export declare class FastDictFactory {
    NumberDICT: string[];
    StringDICT: Map<string, string>;
    constructor();
    get(word: string): string;
    set(word: string, pinyin: string): void;
    clear(): void;
}
