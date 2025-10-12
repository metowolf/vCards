export interface Options {
	/**
	Treat uppercase and lowercase characters as being the same.

	Ensure you use this correctly. For example, files and directories should be matched case-insensitively, while most often, object keys should be matched case-sensitively.

	@default false

	@example
	```
	import {isMatch} from 'matcher';

	isMatch('UNICORN', 'UNI*', {caseSensitive: true});
	//=> true

	isMatch('UNICORN', 'unicorn', {caseSensitive: true});
	//=> false

	isMatch('unicorn', ['tri*', 'UNI*'], {caseSensitive: true});
	//=> false
	```
	*/
	readonly caseSensitive?: boolean;
	/**
	Require all negated patterns to not match and any normal patterns to match at least once. Otherwise, it will be a no-match condition.

	@default false

	@example
	```
	import {matcher} from 'matcher';

	// Find text strings containing both "edge" and "tiger" in arbitrary order, but not "stunt".
	const demo = (strings) => matcher(strings, ['*edge*', '*tiger*', '!*stunt*'], {allPatterns: true});

	demo(['Hey, tiger!', 'tiger has edge over hyenas', 'pushing a tiger over the edge is a stunt']);
	//=> ['tiger has edge over hyenas']
	```

	@example
	```
	import {matcher} from 'matcher';

	matcher(['foo', 'for', 'bar'], ['f*', 'b*', '!x*'], {allPatterns: true});
	//=> ['foo', 'for', 'bar']

	matcher(['foo', 'for', 'bar'], ['f*'], {allPatterns: true});
	//=> []
	```
	*/
	readonly allPatterns?: boolean;
}

/**
Simple [wildcard](https://en.wikipedia.org/wiki/Wildcard_character) matching.

It matches even across newlines. For example, `foo*r` will match `foo\nbar`.

@param inputs - The string or array of strings to match.
@param patterns - The string or array of string patterns. Use `*` to match zero or more characters. A leading `!` negates the pattern.
@returns An array of `inputs` filtered based on the `patterns`.

@example
```
import {matcher} from 'matcher';

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
```
*/
export function matcher(
	inputs: string | readonly string[],
	patterns: string | readonly string[],
	options?: Options,
): string[];

/**
It matches even across newlines. For example, `foo*r` will match `foo\nbar`.

@param inputs - The string or array of strings to match.
@param patterns - The string or array of string patterns. Use `*` to match zero or more characters. A leading `!` negates the pattern.
@returns A `boolean` of whether any of given `inputs` matches all the `patterns`.

@example
```
import {isMatch} from 'matcher';

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

isMatch([''], ['']);
//=> true
```
*/
export function isMatch(
	inputs: string | readonly string[],
	patterns: string | readonly string[],
	options?: Options,
): boolean;
