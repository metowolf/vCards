# arrify

> Convert a value to an array

## Install

```
$ npm install arrify
```

## Usage

```js
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

*Specifying `null` or `undefined` results in an empty array.*

---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-arrify?utm_source=npm-arrify&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
