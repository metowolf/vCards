import {type Transform as TransformStream, type TransformOptions} from 'node:stream';

export type Options = Omit<TransformOptions, 'transform' | 'flush'>;

/**
Receives each chunk and is expected to return a transformed chunk.
*/
export type Transformer = (chunk: unknown, encoding: BufferEncoding, stream: TransformStream) => Promise<unknown>;

/**
Yield additional chunks at the end of the stream.
*/
export type Flusher = () => AsyncGenerator;

/**
Create a transform stream using await instead of callbacks.

@example
```
import transformStream from 'easy-transform-stream';

const stream = transformStream(async chunk => {
	const newChunk = await modifyChunk(chunk);
	return newChunk;
});
```
*/
export default function transformStream(transformer: Transformer, flusher?: Flusher): TransformStream;
export default function transformStream(options: Options, transformer: Transformer, flusher?: Flusher): TransformStream;
