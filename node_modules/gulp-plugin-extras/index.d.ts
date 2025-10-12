import File = require('vinyl');

export type Options = {
	/**
	Whether the plugin can handle directories.

	@default false
	*/
	readonly supportsDirectories?: boolean;

	/**
	Whether the plugin can handle any Vinyl file type.

	Useful for custom type filtering.

	Supersedes `supportsDirectories`.

	@default false
	*/
	readonly supportsAnyType?: boolean;

	/**
	An async generator function executed for finalization after all files have been processed.

	You can yield more files from it if needed.

	@example
	```
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
	*/
	readonly onFinish?: (stream: NodeJS.ReadableStream) => AsyncGenerator<File, never, void>;
};

/**
Create a Gulp plugin.

@param name - The plugin name.
@param onFile - The function called for each vinyl file in the stream. Must return a modified or new vinyl file. May be async.

If you throw an error with a `.isPresentable = true` property, it will not display the error stack.

_This does not support streaming unless you enable the `supportsAnyType` option._

@example
```
import {gulpPlugin} from 'gulp-plugin-extras';

export default function gulpFoo() {
	return gulpPlugin('gulp-foo', async file => {
		file.contents = await someKindOfTransformation(file.contents);
		return file;
	});
}
```
*/
export function gulpPlugin(
	name: string,
	onFile: (file: File) => File | Promise<File>,
	options?: Options
): NodeJS.ReadableStream;

export type PluginErrorOptions = Error & {
	/**
	The plugin name.
	*/
	plugin: string;

	/**
	Error cause indicating the reason why the current error is thrown.
	*/
	cause?: string;

	/**
	The error currently being thrown.
	*/
	error?: Error;

	/**
	The path to the file that raised the error.
	*/
	fileName?: string;

	/**
	The line number where the error occurred.
	*/
	lineNumber?: number;

	/**
	Whether to show relevant properties in the error message details.

	@default true
	*/
	showProperties?: boolean;

	/**
	Whether to show the error stack trace.

	@default false
	*/
	showStack?: boolean;
};

/**
A plugin error.

@example
```
import {PluginError} from 'gulp-plugin-extras';

throw new PluginError('gulpFoo', 'Some error message');
```
*/
export class PluginError implements PluginErrorOptions {
	plugin: string;
	message: string;
	name: string;
	options_: PluginErrorOptions;
	cause?: string;
	error?: Error;
	fileName?: string;
	lineNumber?: number;
	showProperties?: boolean;
	showStack?: boolean;
	stack?: string;

	constructor(options?: PluginErrorOptions);
	constructor(plugin: string, options?: PluginErrorOptions);
	constructor(plugin: string, message: Error | string, options?: PluginErrorOptions);
}
