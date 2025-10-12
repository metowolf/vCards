import {Buffer} from 'node:buffer';

export interface Options {
	/**
	The number of bytes to read.
	*/
	readonly length: number;

	/**
	The position to start reading from.

	@default 0
	*/
	readonly startPosition?: number | bigint;
}

/**
Read a chunk from a file asyncronously.

@param filePath - The path to the file.
@returns The read chunk.

@example
```
import {readChunk} from 'read-chunk';

// foo.txt => hello

await readChunk('foo.txt', {length: 3, startPosition: 1});
//=> 'ell'
```
*/
export function readChunk(filePath: string, options: Options): Promise<Buffer>;

/**
Read a chunk from a file synchronously.

@param filePath - The path to the file.
@returns The read chunk.

@example
```
import {readChunkSync} from 'read-chunk';

// foo.txt => hello

readChunkSync('foo.txt', {length: 3, startPosition: 1});
//=> 'ell'
```
*/
export function readChunkSync(filePath: string, options: Options): Buffer;
