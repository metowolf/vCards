# pkg-conf

> Get namespaced config from the closest package.json

Having tool specific config in package.json reduces the amount of metafiles in your repo (there are usually a lot!) and makes the config obvious compared to hidden dotfiles like `.eslintrc`, which can end up causing confusion. [XO](https://github.com/xojs/xo), for example, uses the `xo` namespace in package.json, and [ESLint](http://eslint.org) uses `eslintConfig`. Many more tools supports this, like [AVA](https://avajs.dev), [Babel](https://babeljs.io), [nyc](https://github.com/istanbuljs/nyc), etc.

## Install

```
$ npm install pkg-conf
```

## Usage

```json
{
	"name": "some-package",
	"version": "1.0.0",
	"unicorn": {
		"rainbow": true
	}
}
```

```js
import {packageConfig} from 'pkg-conf';

const config = await packageConfig('unicorn');

console.log(config.rainbow);
//=> true
```

## API

It [walks up](https://github.com/sindresorhus/find-up) parent directories until a `package.json` can be found, reads it, and returns the user specified namespace or an empty object if not found.

### packageConfig(namespace, options?)

Returns a `Promise` for the config.

### packageConfigSync(namespace, options?)

Returns the config.

#### namespace

Type: `string`

The package.json namespace you want.

#### options

Type: `object`

##### cwd

Type: `string`\
Default: `process.cwd()`

The directory to start looking up for a package.json file.

##### defaults

Type: `object`

The default config.

##### skipOnFalse

Type: `boolean`\
Default: `false`

Skip `package.json` files that have the namespaced config explicitly set to `false`.

Continues searching upwards until the next `package.json` file is reached. This can be useful when you need to support the ability for users to have nested `package.json` files, but only read from the root one, like in the case of [`electron-builder`](https://github.com/electron-userland/electron-builder/wiki/Options#AppMetadata) where you have one `package.json` file for the app and one top-level for development.

Example usage for the user:

```json
{
	"name": "some-package",
	"version": "1.0.0",
	"unicorn": false
}
```

### packageJsonPath(config)

Pass in the config returned from any of the above methods.

Returns the file path to the package.json file or `undefined` if not found.

## Related

- [read-pkg-up](https://github.com/sindresorhus/read-pkg-up) - Read the closest package.json file
- [read-pkg](https://github.com/sindresorhus/read-pkg) - Read a package.json file
- [find-up](https://github.com/sindresorhus/find-up) - Find a file by walking up parent directories
