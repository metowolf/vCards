// From https://github.com/sindresorhus/type-fest
export type JsonValue = string | number | boolean | null | {[Key in string]?: JsonValue} | JsonValue[];

export type Reviver = (this: unknown, key: string, value: unknown) => unknown;
export type BeforeParse = (data: string) => string;

export interface Options {
	/**
	Applies a function to the JSON string before parsing.
	*/
	readonly beforeParse?: BeforeParse;

	/**
	Prescribes how the value originally produced by parsing is transformed, before being returned.
	See the [`JSON.parse` docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter) for more.
	*/
	readonly reviver?: Reviver;
}

/**
Read and parse a JSON file.

It also strips UTF-8 BOM.

@example
```
import {loadJsonFile} from 'load-json-file';

const json = await loadJsonFile('foo.json');
//=> {foo: true}
```
*/
export function loadJsonFile<ReturnValueType = JsonValue>(filePath: string, options?: Options): Promise<ReturnValueType>;

/**
Read and parse a JSON file.

It also strips UTF-8 BOM.

@example
```
import {loadJsonFileSync} from 'load-json-file';

const json = loadJsonFileSync('foo.json');
//=> {foo: true}
```
*/
export function loadJsonFileSync<ReturnValueType = JsonValue>(filePath: string, options?: Options): ReturnValueType;
