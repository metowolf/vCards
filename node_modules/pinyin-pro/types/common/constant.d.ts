export declare const DoubleUnicodePrefixReg: RegExp;
export declare const DoubleUnicodeSuffixReg: RegExp;
export declare const DoubleUnicodeReg: RegExp;
export declare const DoubleUnicodeCharReg: RegExp;
export declare const enum Probability {
    Unknown = 1e-13,
    Rule = 1e-12,
    DICT = 2e-8,
    Surname = 1,
    Custom = 1
}
export declare const Priority: {
    Normal: number;
    Surname: number;
    Custom: number;
};
