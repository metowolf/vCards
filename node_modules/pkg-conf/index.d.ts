export type Config = Record<string, unknown>;

export interface Options<ConfigType extends Config> {
	/**
	The directory to start looking up for a `package.json` file.

	@default process.cwd()
	*/
	readonly cwd?: string;

	/**
	The default config.

	@default {}
	*/
	readonly defaults?: ConfigType;

	/**
	Skip `package.json` files that have the namespaced config explicitly set to `false`.

	Continues searching upwards until the next `package.json` file is reached. This can be useful when you need to support the ability for users to have nested `package.json` files, but only read from the root one, like in the case of [`electron-builder`](https://github.com/electron-userland/electron-builder/wiki/Options#AppMetadata) where you have one `package.json` file for the app and one top-level for development.

	@default false

	@example
	```
	{
		"name": "some-package",
		"version": "1.0.0",
		"unicorn": false
	}
	```
	*/
	readonly skipOnFalse?: boolean;
}

/**
It [walks up](https://github.com/sindresorhus/find-up) parent directories until a `package.json` can be found, reads it, and returns the user specified namespace or an empty object if not found.

@param namespace - The `package.json` namespace you want.
@returns A `Promise` for the config.

@example
```
// {
// 	"name": "some-package",
// 	"version": "1.0.0",
// 	"unicorn": {
// 		"rainbow": true
// 	}
// }

import {packageConfig} from 'pkg-conf';

const config = await packageConfig('unicorn');

console.log(config.rainbow);
//=> true
```
*/
export function packageConfig<ConfigType extends Config = Config>(
	namespace: string,
	options?: Options<ConfigType>
): Promise<ConfigType & Config>;

/**
It [walks up](https://github.com/sindresorhus/find-up) parent directories until a `package.json` can be found, reads it, and returns the user specified namespace or an empty object if not found.

@param namespace - The `package.json` namespace you want.
@returns Returns the config.

@example
```
// {
// 	"name": "some-package",
// 	"version": "1.0.0",
// 	"unicorn": {
// 		"rainbow": true
// 	}
// }

import {packageConfigSync} from 'pkg-conf';

const config = packageConfigSync('unicorn');

console.log(config.rainbow);
//=> true
```
*/
export function packageConfigSync<ConfigType extends Config = Config>(
	namespace: string,
	options?: Options<ConfigType>
): ConfigType & Config;

/**
@param config - The config returned from any of the above methods.
@returns The file path to the `package.json` file or `undefined` if not found.
*/
export function packageJsonPath(config: Config): string | undefined;
