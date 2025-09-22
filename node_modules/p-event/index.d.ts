export type AddRemoveListener<EventName extends string | symbol, Arguments extends unknown[]> = (
	event: EventName,
	listener: (...arguments: Arguments) => void
) => void;

export interface Emitter<EventName extends string | symbol, EmittedType extends unknown[]> {
	on?: AddRemoveListener<EventName, EmittedType>;
	addListener?: AddRemoveListener<EventName, EmittedType>;
	addEventListener?: AddRemoveListener<EventName, EmittedType>;
	off?: AddRemoveListener<EventName, EmittedType>;
	removeListener?: AddRemoveListener<EventName, EmittedType>;
	removeEventListener?: AddRemoveListener<EventName, EmittedType>;
}

export type FilterFunction<ElementType extends unknown | unknown[]> = (
	value: ElementType
) => boolean;

export interface CancelablePromise<ResolveType> extends Promise<ResolveType> {
	cancel(): void;
}

export interface Options<EmittedType extends unknown | unknown[]> {
	/**
	Events that will reject the promise.

	@default ['error']
	*/
	readonly rejectionEvents?: ReadonlyArray<string | symbol>;

	/**
	By default, the promisified function will only return the first argument from the event callback, which works fine for most APIs. This option can be useful for APIs that return multiple arguments in the callback. Turning this on will make it return an array of all arguments from the callback, instead of just the first argument. This also applies to rejections.

	@default false

	@example
	```
	import {pEvent} from 'p-event';
	import emitter from './some-event-emitter';

	const [foo, bar] = await pEvent(emitter, 'finish', {multiArgs: true});
	```
	*/
	readonly multiArgs?: boolean;

	/**
	The time in milliseconds before timing out.

	@default Infinity
	*/
	readonly timeout?: number;

	/**
	A filter function for accepting an event.

	@example
	```
	import {pEvent} from 'p-event';
	import emitter from './some-event-emitter';

	const result = await pEvent(emitter, '🦄', value => value > 3);
	// Do something with first 🦄 event with a value greater than 3
	```
	*/
	readonly filter?: FilterFunction<EmittedType>;
}

export interface MultiArgumentsOptions<EmittedType extends unknown[]>
	extends Options<EmittedType> {
	readonly multiArgs: true;
}

export interface MultipleOptions<EmittedType extends unknown | unknown[]>
	extends Options<EmittedType> {
	/**
	The number of times the event needs to be emitted before the promise resolves.
	*/
	readonly count: number;

	/**
	Whether to resolve the promise immediately. Emitting one of the `rejectionEvents` won't throw an error.

	__Note__: The returned array will be mutated when an event is emitted.

	@example
	```
	import {pEventMultiple} from 'p-event';

	const emitter = new EventEmitter();

	const promise = pEventMultiple(emitter, 'hello', {
		resolveImmediately: true,
		count: Infinity
	});

	const result = await promise;
	console.log(result);
	//=> []

	emitter.emit('hello', 'Jack');
	console.log(result);
	//=> ['Jack']

	emitter.emit('hello', 'Mark');
	console.log(result);
	//=> ['Jack', 'Mark']

	// Stops listening
	emitter.emit('error', new Error('😿'));

	emitter.emit('hello', 'John');
	console.log(result);
	//=> ['Jack', 'Mark']
	```
	*/
	readonly resolveImmediately?: boolean;
}

export interface MultipleMultiArgumentsOptions<EmittedType extends unknown[]>
	extends MultipleOptions<EmittedType> {
	readonly multiArgs: true;
}

export interface IteratorOptions<EmittedType extends unknown | unknown[]>
	extends Options<EmittedType> {
	/**
	The maximum number of events for the iterator before it ends. When the limit is reached, the iterator will be marked as `done`. This option is useful to paginate events, for example, fetching 10 events per page.

	@default Infinity
	*/
	readonly limit?: number;

	/**
	Events that will end the iterator.

	@default []
	*/
	readonly resolutionEvents?: ReadonlyArray<string | symbol>;
}

export interface IteratorMultiArgumentsOptions<EmittedType extends unknown[]>
	extends IteratorOptions<EmittedType> {
	multiArgs: true;
}

/**
Promisify an event by waiting for it to be emitted.

@param emitter - Event emitter object. Should have either a `.on()`/`.addListener()`/`.addEventListener()` and `.off()`/`.removeListener()`/`.removeEventListener()` method, like the [Node.js `EventEmitter`](https://nodejs.org/api/events.html) and [DOM events](https://developer.mozilla.org/en-US/docs/Web/Events).
@param event - Name of the event or events to listen to. If the same event is defined both here and in `rejectionEvents`, this one takes priority.*Note**: `event` is a string for a single event type, for example, `'data'`. To listen on multiple events, pass an array of strings, such as `['started', 'stopped']`.
@returns Fulfills when emitter emits an event matching `event`, or rejects if emitter emits any of the events defined in the `rejectionEvents` option. The returned promise has a `.cancel()` method, which when called, removes the event listeners and causes the promise to never be settled.

@example
```
import {pEvent} from 'p-event';
import emitter from './some-event-emitter';

// In Node.js:
try {
	const result = await pEvent(emitter, 'finish');

	// `emitter` emitted a `finish` event
	console.log(result);
} catch (error) {
	// `emitter` emitted an `error` event
	console.error(error);
}

// In the browser:
await pEvent(document, 'DOMContentLoaded');
console.log('😎');
```
*/
export function pEvent<EventName extends string | symbol, EmittedType extends unknown[]>(
	emitter: Emitter<EventName, EmittedType>,
	event: string | symbol | ReadonlyArray<string | symbol>,
	options: MultiArgumentsOptions<EmittedType>
): CancelablePromise<EmittedType>;
export function pEvent<EventName extends string | symbol, EmittedType>(
	emitter: Emitter<EventName, [EmittedType]>,
	event: string | symbol | ReadonlyArray<string | symbol>,
	filter: FilterFunction<EmittedType>
): CancelablePromise<EmittedType>;
export function pEvent<EventName extends string | symbol, EmittedType>(
	emitter: Emitter<EventName, [EmittedType]>,
	event: string | symbol | ReadonlyArray<string | symbol>,
	options?: Options<EmittedType>
): CancelablePromise<EmittedType>;

/**
Wait for multiple event emissions.
*/
export function pEventMultiple<EventName extends string | symbol, EmittedType extends unknown[]>(
	emitter: Emitter<EventName, EmittedType>,
	event: string | symbol | ReadonlyArray<string | symbol>,
	options: MultipleMultiArgumentsOptions<EmittedType>
): CancelablePromise<EmittedType[]>;
export function pEventMultiple<EventName extends string | symbol, EmittedType>(
	emitter: Emitter<EventName, [EmittedType]>,
	event: string | symbol | ReadonlyArray<string | symbol>,
	options: MultipleOptions<EmittedType>
): CancelablePromise<EmittedType[]>;

/**
@returns An [async iterator](https://2ality.com/2016/10/asynchronous-iteration.html) that lets you asynchronously iterate over events of `event` emitted from `emitter`. The iterator ends when `emitter` emits an event matching any of the events defined in `resolutionEvents`, or rejects if `emitter` emits any of the events defined in the `rejectionEvents` option.

@example
```
import {pEventIterator} from 'p-event';
import emitter from './some-event-emitter';

const asyncIterator = pEventIterator(emitter, 'data', {
	resolutionEvents: ['finish']
});

for await (const event of asyncIterator) {
	console.log(event);
}
```
*/
export function pEventIterator<EventName extends string | symbol, EmittedType extends unknown[]>(
	emitter: Emitter<EventName, EmittedType>,
	event: string | symbol | ReadonlyArray<string | symbol>,
	options: IteratorMultiArgumentsOptions<EmittedType>
): AsyncIterableIterator<EmittedType>;
export function pEventIterator<EventName extends string | symbol, EmittedType>(
	emitter: Emitter<EventName, [EmittedType]>,
	event: string | symbol | ReadonlyArray<string | symbol>,
	filter: FilterFunction<EmittedType>
): AsyncIterableIterator<EmittedType>;
export function pEventIterator<EventName extends string | symbol, EmittedType>(
	emitter: Emitter<EventName, [EmittedType]>,
	event: string | symbol | ReadonlyArray<string | symbol>,
	options?: IteratorOptions<EmittedType>
): AsyncIterableIterator<EmittedType>;

export {TimeoutError} from 'p-timeout';
