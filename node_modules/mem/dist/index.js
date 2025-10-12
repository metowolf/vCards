import mimicFn from 'mimic-fn';
import mapAgeCleaner from 'map-age-cleaner';
const cacheStore = new WeakMap();
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
export default function mem(fn, { cacheKey, cache = new Map(), maxAge, } = {}) {
    if (typeof maxAge === 'number') {
        mapAgeCleaner(cache);
    }
    const memoized = function (...arguments_) {
        const key = cacheKey ? cacheKey(arguments_) : arguments_[0];
        const cacheItem = cache.get(key);
        if (cacheItem) {
            return cacheItem.data; // eslint-disable-line @typescript-eslint/no-unsafe-return
        }
        const result = fn.apply(this, arguments_);
        cache.set(key, {
            data: result,
            maxAge: maxAge ? Date.now() + maxAge : Number.POSITIVE_INFINITY,
        });
        return result; // eslint-disable-line @typescript-eslint/no-unsafe-return
    };
    mimicFn(memoized, fn, {
        ignoreNonConfigurable: true,
    });
    cacheStore.set(memoized, cache);
    return memoized;
}
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
export function memDecorator(options = {}) {
    const instanceMap = new WeakMap();
    return (target, propertyKey, descriptor) => {
        const input = target[propertyKey]; // eslint-disable-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        if (typeof input !== 'function') {
            throw new TypeError('The decorated value must be a function');
        }
        delete descriptor.value;
        delete descriptor.writable;
        descriptor.get = function () {
            if (!instanceMap.has(this)) {
                const value = mem(input, options);
                instanceMap.set(this, value);
                return value;
            }
            return instanceMap.get(this);
        };
    };
}
/**
Clear all cached data of a memoized function.

@param fn - Memoized function.
*/
export function memClear(fn) {
    const cache = cacheStore.get(fn);
    if (!cache) {
        throw new TypeError('Can\'t clear a function that was not memoized!');
    }
    if (typeof cache.clear !== 'function') {
        throw new TypeError('The cache Map can\'t be cleared!');
    }
    cache.clear();
}
