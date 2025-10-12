declare type AnyFunction = (...arguments_: any) => any;
interface CacheStorageContent<ValueType> {
    data: ValueType;
    maxAge: number;
}
interface CacheStorage<KeyType, ValueType> {
    has: (key: KeyType) => boolean;
    get: (key: KeyType) => CacheStorageContent<ValueType> | undefined;
    set: (key: KeyType, value: CacheStorageContent<ValueType>) => void;
    delete: (key: KeyType) => void;
    clear?: () => void;
}
export interface Options<FunctionToMemoize extends AnyFunction, CacheKeyType> {
    /**
    Milliseconds until the cache expires.

    @default Infinity
    */
    readonly maxAge?: number;
    /**
    Determines the cache key for storing the result based on the function arguments. By default, __only the first argument is considered__ and it only works with [primitives](https://developer.mozilla.org/en-US/docs/Glossary/Primitive).

    A `cacheKey` function can return any type supported by `Map` (or whatever structure you use in the `cache` option).

    You can have it cache **all** the arguments by value with `JSON.stringify`, if they are compatible:

    ```
    import mem from 'mem';

    mem(function_, {cacheKey: JSON.stringify});
    ```

    Or you can use a more full-featured serializer like [serialize-javascript](https://github.com/yahoo/serialize-javascript) to add support for `RegExp`, `Date` and so on.

    ```
    import mem from 'mem';
    import serializeJavascript from 'serialize-javascript';

    mem(function_, {cacheKey: serializeJavascript});
    ```

    @default arguments_ => arguments_[0]
    @example arguments_ => JSON.stringify(arguments_)
    */
    readonly cacheKey?: (arguments_: Parameters<FunctionToMemoize>) => CacheKeyType;
    /**
    Use a different cache storage. Must implement the following methods: `.has(key)`, `.get(key)`, `.set(key, value)`, `.delete(key)`, and optionally `.clear()`. You could for example use a `WeakMap` instead or [`quick-lru`](https://github.com/sindresorhus/quick-lru) for a LRU cache.

    @default new Map()
    @example new WeakMap()
    */
    readonly cache?: CacheStorage<CacheKeyType, ReturnType<FunctionToMemoize>>;
}
/**
[Memoize](https://en.wikipedia.org/wiki/Memoization) functions - An optimization used to speed up consecutive function calls by caching the result of calls with identical input.

@param fn - Function to be memoized.

@example
```
import mem from 'mem';

let index = 0;
const counter = () => ++index;
const memoized = mem(counter);

memoized('foo');
//=> 1

// Cached as it's the same argument
memoized('foo');
//=> 1

// Not cached anymore as the arguments changed
memoized('bar');
//=> 2

memoized('bar');
//=> 2
```
*/
export default function mem<FunctionToMemoize extends AnyFunction, CacheKeyType>(fn: FunctionToMemoize, { cacheKey, cache, maxAge, }?: Options<FunctionToMemoize, CacheKeyType>): FunctionToMemoize;
/**
@returns A [decorator](https://github.com/tc39/proposal-decorators) to memoize class methods or static class methods.

@example
```
import {memDecorator} from 'mem';

class Example {
    index = 0

    @memDecorator()
    counter() {
        return ++this.index;
    }
}

class ExampleWithOptions {
    index = 0

    @memDecorator({maxAge: 1000})
    counter() {
        return ++this.index;
    }
}
```
*/
export declare function memDecorator<FunctionToMemoize extends AnyFunction, CacheKeyType>(options?: Options<FunctionToMemoize, CacheKeyType>): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => void;
/**
Clear all cached data of a memoized function.

@param fn - Memoized function.
*/
export declare function memClear(fn: AnyFunction): void;
export {};
