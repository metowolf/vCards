# p-map

> Map over promises concurrently

Useful when you need to run promise-returning & async functions multiple times with different inputs concurrently.

This is different from `Promise.all()` in that you can control the concurrency and also decide whether or not to stop iterating when there's an error.

## Install

```
$ npm install p-map
```

## Usage

```js
import pMap from 'p-map';
import got from 'got';

const sites = [
	getWebsiteFromUsername('sindresorhus'), //=> Promise
	'https://avajs.dev',
	'https://github.com'
];

const mapper = async site => {
	const {requestUrl} = await got.head(site);
	return requestUrl;
};

const result = await pMap(sites, mapper, {concurrency: 2});

console.log(result);
//=> ['https://sindresorhus.com/', 'https://avajs.dev/', 'https://github.com/']
```

## API

### pMap(input, mapper, options?)

Returns a `Promise` that is fulfilled when all promises in `input` and ones returned from `mapper` are fulfilled, or rejects if any of the promises reject. The fulfilled value is an `Array` of the fulfilled values returned from `mapper` in `input` order.

#### input

Type: `AsyncIterable<Promise<unknown> | unknown> | Iterable<Promise<unknown> | unknown>`

Synchronous or asynchronous iterable that is iterated over concurrently, calling the `mapper` function for each element. Each iterated item is `await`'d before the `mapper` is invoked so the iterable may return a `Promise` that resolves to an item.

Asynchronous iterables (different from synchronous iterables that return `Promise` that resolves to an item) can be used when the next item may not be ready without waiting for an asynchronous process to complete and/or the end of the iterable may be reached after the asynchronous process completes. For example, reading from a remote queue when the queue has reached empty, or reading lines from a stream.

#### mapper(element, index)

Type: `Function`

Expected to return a `Promise` or value.

#### options

Type: `object`

##### concurrency

Type: `number` *(Integer)*\
Default: `Infinity`\
Minimum: `1`

Number of concurrently pending promises returned by `mapper`.

##### stopOnError

Type: `boolean`\
Default: `true`

When `true`, the first mapper rejection will be rejected back to the consumer.

When `false`, instead of stopping when a promise rejects, it will wait for all the promises to settle and then reject with an [aggregated error](https://github.com/sindresorhus/aggregate-error) containing all the errors from the rejected promises.

Caveat: When `true`, any already-started async mappers will continue to run until they resolve or reject. In the case of infinite concurrency with sync iterables, *all* mappers are invoked on startup and will continue after the first rejection. [Issue #51](https://github.com/sindresorhus/p-map/issues/51) can be implemented for abort control.

##### signal

Type: [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)

You can abort the promises using [`AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

*Requires Node.js 16 or later.*

```js
import pMap from 'p-map';
import delay from 'delay';

const abortController = new AbortController();

setTimeout(() => {
	abortController.abort();
}, 500);

const mapper = async value => value;

await pMap([delay(1000), delay(1000)], mapper, {signal: abortController.signal});
// Throws AbortError (DOMException) after 500 ms.
```

### pMapSkip

Return this value from a `mapper` function to skip including the value in the returned array.

```js
import pMap, {pMapSkip} from 'p-map';
import got from 'got';

const sites = [
	getWebsiteFromUsername('sindresorhus'), //=> Promise
	'https://avajs.dev',
	'https://example.invalid',
	'https://github.com'
];

const mapper = async site => {
	try {
		const {requestUrl} = await got.head(site);
		return requestUrl;
	} catch {
		return pMapSkip;
	}
};

const result = await pMap(sites, mapper, {concurrency: 2});

console.log(result);
//=> ['https://sindresorhus.com/', 'https://avajs.dev/', 'https://github.com/']
```

## p-map for enterprise

Available as part of the Tidelift Subscription.

The maintainers of p-map and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-p-map?utm_source=npm-p-map&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Related

- [p-all](https://github.com/sindresorhus/p-all) - Run promise-returning & async functions concurrently with optional limited concurrency
- [p-filter](https://github.com/sindresorhus/p-filter) - Filter promises concurrently
- [p-times](https://github.com/sindresorhus/p-times) - Run promise-returning & async functions a specific number of times concurrently
- [p-props](https://github.com/sindresorhus/p-props) - Like `Promise.all()` but for `Map` and `Object`
- [p-map-series](https://github.com/sindresorhus/p-map-series) - Map over promises serially
- [p-queue](https://github.com/sindresorhus/p-queue) - Promise queue with concurrency control
- [More…](https://github.com/sindresorhus/promise-fun)
