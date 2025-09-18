import { serializeError } from 'serialize-error';
import indentString from 'indent-string';
import stripAnsi from 'strip-ansi';
import yaml from 'js-yaml';
const serializeErrorForTap = (error) => {
    var _a;
    const object = serializeError(error);
    object['at'] = ((_a = object.stack) !== null && _a !== void 0 ? _a : '')
        .split('\n')
        .slice(1, 2)
        .map((line) => line.replace(/at/, '').trim())
        .shift();
    delete object.stack;
    return object;
};
export const start = () => 'TAP version 13';
export const test = (title, options) => {
    const { error } = options;
    let { passed } = options;
    let directive = '';
    if (!error) {
        if (options.todo) {
            directive = '# TODO';
            passed = false;
        }
        else if (options.skip) {
            directive = '# SKIP';
            passed = true;
        }
    }
    let comment = '';
    if (options.comment) {
        const comments = Array.isArray(options.comment)
            ? options.comment
            : [options.comment];
        comment = comments
            .map(line => indentString(line, 4).replace(/^ {4}/gm, '#   '))
            .join('\n');
    }
    const output = [
        `${passed ? 'ok' : 'not ok'} ${options.index} - ${stripAnsi(title)} ${directive}`.trim(),
        comment,
    ];
    if (error) {
        const object = error instanceof Error ? serializeErrorForTap(error) : error;
        output.push(['  ---', indentString(yaml.safeDump(object).trim(), 4), '  ...'].join('\n'));
    }
    return output.filter(Boolean).join('\n');
};
export const finish = (stats) => {
    var _a, _b, _c, _d, _e;
    stats = stats !== null && stats !== void 0 ? stats : {};
    const passed = (_a = stats.passed) !== null && _a !== void 0 ? _a : 0;
    const failed = (_b = stats.failed) !== null && _b !== void 0 ? _b : 0;
    const skipped = (_c = stats.skipped) !== null && _c !== void 0 ? _c : 0;
    const todo = (_d = stats.todo) !== null && _d !== void 0 ? _d : 0;
    const crashed = (_e = stats.crashed) !== null && _e !== void 0 ? _e : 0;
    return [
        `\n1..${passed + failed + skipped + todo}`,
        `# tests ${passed + failed + skipped}`,
        `# pass ${passed}`,
        skipped > 0 ? `# skip ${skipped}` : null,
        `# fail ${failed + crashed + todo}\n`,
    ]
        .filter(Boolean)
        .join('\n');
};
