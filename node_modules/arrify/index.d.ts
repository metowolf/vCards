/**
Convert a value to an array.

_Specifying `null` or `undefined` results in an empty array._

@example
```
import arrify from 'arrify';

arrify('🦄');
//=> ['🦄']

arrify(['🦄']);
//=> ['🦄']

arrify(new Set(['🦄']));
//=> ['🦄']

arrify(null);
//=> []

arrify(undefined);
//=> []
```
*/
export default function arrify<ValueType>(
	value: ValueType
): ValueType extends (null | undefined)
	? [] // eslint-disable-line  @typescript-eslint/ban-types
	: ValueType extends string
		? [string]
		: ValueType extends readonly unknown[]
			? ValueType
			: ValueType extends Iterable<infer T>
				? T[]
				: [ValueType];
