# easy-transform-stream

> Create a transform stream using await instead of callbacks

The built-in [`stream.Transform` constructor](https://nodejs.org/api/stream.html#class-streamtransform) forces you to deal with a callback interface. It's much nicer to just be able to await and return a value.

This package can be thought of as a modern version of [`through2`](https://github.com/rvagg/through2).

## Install

```sh
npm install easy-transform-stream
```

## Usage

```js
import transformStream from 'easy-transform-stream';

const stream = transformStream(async chunk => {
	const newChunk = await modifyChunk(chunk);
	return newChunk;
});
```

## API

### easyTransformStream(transformer, flusher?)
### easyTransformStream(options, transformer, flusher?)

#### transformer(chunk, encoding, stream)

Type: Async function

Receives each chunk and is expected to return a transformed chunk.

#### flusher(stream)

Type: Async generator function

Yield additional chunks at the end of the stream.

#### options

Type: `object`

Same as the [options for `stream.Transform`](https://nodejs.org/api/stream.html#new-streamtransformoptions), except for `transform` and `flush`.

## Related

- [get-stream](https://github.com/sindresorhus/get-stream) - Get a stream as a string, buffer, or array
