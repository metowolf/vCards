/**
 * @description: AC 自动机
 */
export interface Pattern {
    zh: string;
    pinyin: string;
    probability: number;
    length: number;
    isSurname?: boolean;
}
interface MatchPattern extends Pattern {
    index: number;
}
declare class TrieNode {
    children: Map<string, TrieNode>;
    fail: TrieNode | null;
    patterns: Pattern[];
    constructor();
}
export declare class AC {
    root: TrieNode;
    constructor();
    buildTrie(patternList: Pattern[]): void;
    insertPattern(patterns: Pattern[], pattern: Pattern): void;
    reset(): void;
    buildFailPointer(): void;
    search(text: string, isSurname?: boolean): MatchPattern[];
    filterWithReverseMaxMatch(patterns: MatchPattern[]): MatchPattern[];
    filterWithMaxProbability(patterns: MatchPattern[], isSurname?: boolean): MatchPattern[];
    filter(patterns: MatchPattern[], isSurname?: boolean): MatchPattern[];
}
export declare const PatternsNormal: Pattern[];
export declare const acTree: AC;
export {};
