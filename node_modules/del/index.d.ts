import {Options as GlobbyOptions} from 'globby';

export interface ProgressData {
	/**
	Deleted files and directories count.
	*/
	readonly deletedCount: number;

	/**
	Total files and directories count.
	*/
	readonly totalCount: number;

	/**
	Completed percentage. A value between `0` and `1`.
	*/
	readonly percent: number;
}

export interface Options extends GlobbyOptions {
	/**
	Allow deleting the current working directory and outside.

	@default false
	*/
	readonly force?: boolean;

	/**
	See what would be deleted.

	@default false

	@example
	```
	import {deleteAsync} from 'del';

	const deletedPaths = await deleteAsync(['temp/*.js'], {dryRun: true});

	console.log('Files and directories that would be deleted:\n', deletedPaths.join('\n'));
	```
	*/
	readonly dryRun?: boolean;

	/**
	Concurrency limit. Minimum: `1`.

	@default Infinity
	*/
	readonly concurrency?: number;

	/**
	Called after each file or directory is deleted.

	@example
	```
	import {deleteAsync} from 'del';

	await deleteAsync(patterns, {
		onProgress: progress => {
		// …
	}});
	```
	*/
	readonly onProgress?: (progress: ProgressData) => void;
}

/**
Delete files and directories using glob patterns.

Note that glob patterns can only contain forward-slashes, not backward-slashes. Windows file paths can use backward-slashes as long as the path does not contain any glob-like characters, otherwise use `path.posix.join()` instead of `path.join()`.

@param patterns - See the supported [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).
- [Pattern examples with expected matches](https://github.com/sindresorhus/multimatch/blob/main/test/test.js)
- [Quick globbing pattern overview](https://github.com/sindresorhus/multimatch#globbing-patterns)
@param options - You can specify any of the [`globby` options](https://github.com/sindresorhus/globby#options) in addition to the `del` options. In contrast to the `globby` defaults, `expandDirectories`, `onlyFiles`, and `followSymbolicLinks` are `false` by default.
@returns The deleted paths.

@example
```
import {deleteAsync} from 'del';

const deletedPaths = await deleteAsync(['temp/*.js', '!temp/unicorn.js']);

console.log('Deleted files and directories:\n', deletedPaths.join('\n'));
```
*/
export function deleteAsync(
	patterns: string | readonly string[],
	options?: Options
): Promise<string[]>;

/**
Synchronously delete files and directories using glob patterns.

Note that glob patterns can only contain forward-slashes, not backward-slashes. Windows file paths can use backward-slashes as long as the path does not contain any glob-like characters, otherwise use `path.posix.join()` instead of `path.join()`.

@param patterns - See the supported [glob patterns](https://github.com/sindresorhus/globby#globbing-patterns).
- [Pattern examples with expected matches](https://github.com/sindresorhus/multimatch/blob/main/test/test.js)
- [Quick globbing pattern overview](https://github.com/sindresorhus/multimatch#globbing-patterns)
@param options - You can specify any of the [`globby` options](https://github.com/sindresorhus/globby#options) in addition to the `del` options. In contrast to the `globby` defaults, `expandDirectories`, `onlyFiles`, and `followSymbolicLinks` are `false` by default.
@returns The deleted paths.
*/
export function deleteSync(
	patterns: string | readonly string[],
	options?: Options
): string[];
