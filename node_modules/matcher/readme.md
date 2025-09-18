# matcher

> Simple [wildcard](https://en.wikipedia.org/wiki/Wildcard_character) matching

Useful when you want to accept loose string input and regexes/globs are too convoluted.

## Install

```sh
npm install matcher
```

## Usage

```js
import {matcher, isMatch} from 'matcher';

matcher(['foo', 'bar', 'moo'], ['*oo', '!foo']);
//=> ['moo']

matcher(['foo', 'bar', 'moo'], ['!*oo']);
//=> ['bar']

matcher('moo', ['']);
//=> []

matcher('moo', []);
//=> []

matcher([''], ['']);
//=> ['']

isMatch('unicorn', 'uni*');
//=> true

isMatch('unicorn', '*corn');
//=> true

isMatch('unicorn', 'un*rn');
//=> true

isMatch('rainbow', '!unicorn');
//=> true

isMatch('foo bar baz', 'foo b* b*');
//=> true

isMatch('unicorn', 'uni\\*');
//=> false

isMatch(['foo', 'bar'], 'f*');
//=> true

isMatch(['foo', 'bar'], ['a*', 'b*']);
//=> true

isMatch('unicorn', ['']);
//=> false

isMatch('unicorn', []);
//=> false

isMatch([], 'bar');
//=> false

isMatch([], []);
//=> false

isMatch('', '');
//=> true
```

## API

It matches even across newlines. For example, `foo*r` will match `foo\nbar`.

### matcher(inputs, patterns, options?)

Accepts a string or an array of strings for both `inputs` and `patterns`.

Returns an array of `inputs` filtered based on the `patterns`.

### isMatch(inputs, patterns, options?)

Accepts a string or an array of strings for both `inputs` and `patterns`.

Returns a `boolean` of whether any of given `inputs` matches all the `patterns`.

#### inputs

Type: `string | string[]`

The string or array of strings to match.

#### options

Type: `object`

##### caseSensitive

Type: `boolean`\
Default: `false`

Treat uppercase and lowercase characters as being the same.

Ensure you use this correctly. For example, files and directories should be matched case-insensitively, while most often, object keys should be matched case-sensitively.

```js
import {isMatch} from 'matcher';

isMatch('UNICORN', 'UNI*', {caseSensitive: true});
//=> true

isMatch('UNICORN', 'unicorn', {caseSensitive: true});
//=> false

isMatch('unicorn', ['tri*', 'UNI*'], {caseSensitive: true});
//=> false
```

##### allPatterns

Type: `boolean`\
Default: `false`

Require all negated patterns to not match and any normal patterns to match at least once. Otherwise, it will be a no-match condition.

```js
import {matcher} from 'matcher';

// Find text strings containing both "edge" and "tiger" in arbitrary order, but not "stunt".
const demo = (strings) => matcher(strings, ['*edge*', '*tiger*', '!*stunt*'], {allPatterns: true});

demo(['Hey, tiger!', 'tiger has edge over hyenas', 'pushing a tiger over the edge is a stunt']);
//=> ['tiger has edge over hyenas']
```

```js
import {matcher} from 'matcher';

matcher(['foo', 'for', 'bar'], ['f*', 'b*', '!x*'], {allPatterns: true});
//=> ['foo', 'for', 'bar']

matcher(['foo', 'for', 'bar'], ['f*'], {allPatterns: true});
//=> []
```

#### patterns

Type: `string | string[]`

Use `*` to match zero or more characters.

A leading `!` negates the pattern.

An input string will be omitted, if it does not match any non-negated patterns present, or if it matches a negated pattern, or if no pattern is present.

## Benchmark

```sh
npm run bench
```

## Related

- [matcher-cli](https://github.com/sindresorhus/matcher-cli) - CLI for this module
- [multimatch](https://github.com/sindresorhus/multimatch) - Extends `minimatch.match()` with support for multiple patterns

---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-matcher?utm_source=npm-matcher&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
