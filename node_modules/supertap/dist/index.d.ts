export declare const start: () => string;
interface Options {
    index: number;
    passed?: boolean;
    error?: Error | Record<string, unknown>;
    todo?: boolean;
    skip?: boolean;
    comment: string | string[];
}
export declare const test: (title: string, options: Options) => string;
interface Stats {
    passed?: number;
    failed?: number;
    skipped?: number;
    todo?: number;
    crashed?: number;
}
export declare const finish: (stats: Stats) => string;
export {};
