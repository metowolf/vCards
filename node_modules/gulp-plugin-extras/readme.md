# gulp-plugin-extras

> Useful utilities for creating [Gulp](https://github.com/gulpjs/gulp) plugins

## Install

```sh
npm install gulp-plugin-extras
```

## Usage

```js
import {gulpPlugin, PluginError} from 'gulp-plugin-extras';

const pluginName = 'gulp-foo';

export default function gulpFoo(requiredArgument) {
	if (!requiredArgument) {
		throw new PluginError(pluginName, 'Missing argument `requiredArgument`');
	}

	return gulpPlugin(pluginName, async file => {
		file.contents = await someKindOfTransformation(file.contents);
		return file;
	});
}
```

## API

### `gulpPlugin(name, onFile, options?)`

Create a Gulp plugin.

If you throw an error with a `.isPresentable = true` property, it will not display the error stack.

*This does not support streaming unless you enable the `supportsAnyType` option.*

#### name

Type: `string`

The plugin name.

#### onFile

Type: `(file) => file`

The function called for each [Vinyl file](https://github.com/gulpjs/vinyl) in the stream. Must return a modified or new Vinyl file. May be async.

#### options

Type: `object`

##### supportsDirectories

Type: `boolean`\
Default: `false`

Whether the plugin can handle directories.

##### supportsAnyType

Type: `boolean`\
Default: `false`

Whether the plugin can handle any Vinyl file type.

Useful for custom type filtering.

Supersedes `supportsDirectories`.

##### onFinish

Type: `async function * (stream: NodeJS.ReadableStream): AsyncGenerator<File, never, void>`

An async generator function executed for finalization after all files have been processed.

You can yield more files from it if needed.

```js
import {gulpPlugin} from 'gulp-plugin-extras';

export default function gulpFoo() {
	return gulpPlugin(
		'gulp-foo',
		async file => { … },
		{
			async * onFinish() {
				yield someVinylFile;
				yield someVinylFile2;
			}
		}
	);
}
```

### `PluginError`

Create a Gulp plugin error. See the [types](index.d.ts) for docs.
