const test = require('ava');
const arrgv = require('.');

test('return array', t => {
    t.true(Array.isArray(arrgv()), 'array must be returned when no args');
    t.true(Array.isArray(arrgv('')), 'array must be returned on enpty string');
    t.true(Array.isArray(arrgv(1)), 'array must be returned on number');
    t.true(Array.isArray(arrgv([])), 'array must be returned on array');
    t.true(Array.isArray(arrgv({})), 'array must be returned on object');
    t.true(Array.isArray(arrgv(true)), 'array must be returned on true');
    t.true(Array.isArray(arrgv(false)), 'array must be returned on false');
    t.true(Array.isArray(arrgv(null)), 'array must be returned on null');
    t.true(Array.isArray(arrgv(undefined)), 'array must be returned when on undefined');
});

test('split', t => {
    t.deepEqual(arrgv('aaa bbb ccc'), ['aaa', 'bbb', 'ccc'], 'splits easy args by space');
    t.deepEqual(arrgv('  aaa bbb ccc  '), ['aaa', 'bbb', 'ccc'], 'trailing and leading spaces do not counts');
    t.deepEqual(arrgv('aaa   bbb    ccc'), ['aaa', 'bbb', 'ccc'], 'multi space works as single');
});

test('double quotes', t => {
    t.deepEqual(arrgv('aaa "bbb" ccc'), ['aaa', 'bbb', 'ccc'], 'no double quotes in string args');
    t.deepEqual(arrgv('aaa "b\'bb" ccc'), ['aaa', 'b\'bb', 'ccc'], 'single quote saved in double quotes');
    t.deepEqual(arrgv('aaa "bb"b ccc'), ['aaa', 'bbb', 'ccc'], 'no double quotes inside words');
    t.deepEqual(arrgv('aaa "bbb ccc" ddd'), ['aaa', 'bbb ccc', 'ddd'], 'multi word args in double quotes');
    t.deepEqual(arrgv('aaa bbb" "ccc ddd'), ['aaa', 'bbb ccc', 'ddd'], 'multi word args with double quoted space');
    t.deepEqual(arrgv('aaa b"bb cc"c ddd'), ['aaa', 'bbb ccc', 'ddd'], 'double quotes in words make string arg');
    t.deepEqual(arrgv('aaa "" bbb'), ['aaa', '', 'bbb'], 'empty string in double quotes');
    t.deepEqual(arrgv('aaa ""'), ['aaa', ''], 'empty string in double quotes on last position');
});

test('single quotes', t => {
    t.deepEqual(arrgv(`aaa 'bbb' ccc`), ['aaa', 'bbb', 'ccc'], 'no single quotes in string args');
    t.deepEqual(arrgv(`aaa 'b"bb' ccc`), ['aaa', 'b"bb', 'ccc'], 'double quote saved in single quotes');
    t.deepEqual(arrgv(`aaa 'bb'b ccc`), ['aaa', 'bbb', 'ccc'], 'no single quotes inside words');
    t.deepEqual(arrgv(`aaa 'bbb ccc' ddd`), ['aaa', 'bbb ccc', 'ddd'], 'multi word args in single quotes');
    t.deepEqual(arrgv(`aaa bbb' 'ccc ddd`), ['aaa', 'bbb ccc', 'ddd'], 'multi word args with single quoted space');
    t.deepEqual(arrgv(`aaa b'bb cc'c ddd`), ['aaa', 'bbb ccc', 'ddd'], 'single quotes in words make string arg');
    t.deepEqual(arrgv(`aaa '' bbb`), ['aaa', '', 'bbb'], 'empty string in single quotes');
    t.deepEqual(arrgv(`aaa ''`), ['aaa', ''], 'empty string in single quotes on last position');
});

test('spaces', t => {
    t.deepEqual(arrgv(`aaa\nbbb`), ['aaa', 'bbb'], '\\n is delimiter');
    t.deepEqual(arrgv(`aaa\bbbb`), ['aaa', 'bbb'], '\\b is delimiter');
    t.deepEqual(arrgv(`aaa\rbbb`), ['aaa', 'bbb'], '\\r is delimiter');
    t.deepEqual(arrgv(`aaa\tbbb`), ['aaa', 'bbb'], '\\t is delimiter');
    t.deepEqual(arrgv(`aaa\fbbb`), ['aaa', 'bbb'], '\\f is delimiter');
});

test('slashes', t => {
    t.deepEqual(arrgv('aaa \\"bbb c\\"cc ddd'), ['aaa', '"bbb', 'c"cc', 'ddd'], 'slashed double quotes is usual char');
    t.deepEqual(arrgv(`aaa \\'bbb c\\'cc ddd`), ['aaa', `'bbb`, `c'cc`, 'ddd'], 'slashed single quotes is usual char');
    t.deepEqual(arrgv('\\$\\`\\"\\h aaa'), ['$`"h', 'aaa'], 'no slashes outside quotes');
    t.deepEqual(arrgv('"\\$\\`\\"\\h aaa"'), ['$`"\\h aaa'], 'slashes saved in double quotes except $`"');
    t.deepEqual(arrgv('\'\\$\\`\\h aaa\''), ['\\$\\`\\h aaa'], 'slashes saved in single quotes');
    t.deepEqual(arrgv('"\\\\"'), ['\\'], 'slashes need escaping in double quotes');
    t.deepEqual(arrgv('\'\\\\\''), ['\\\\'], 'slashes saved as is in single quotes');
});

test('errors', t => {
    t.throws(() => {
        arrgv('aaa"bbb');
    }, SyntaxError, 'double quotes must be closed');
    t.throws(() => {
        arrgv('aaa\'bbb');
    }, SyntaxError, 'single quotes must be closed');
    t.throws(() => {
        arrgv('aaa\\');
    }, SyntaxError, 'end of string must not to be escaped');
});

