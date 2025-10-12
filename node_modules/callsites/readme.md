# callsites

> Get callsites from the [V8 stack trace API](https://v8.dev/docs/stack-trace-api)

## Install

```
$ npm install callsites
```

## Usage

```js
import callsites from 'callsites';

function unicorn() {
	console.log(callsites()[0].getFileName());
	//=> '/Users/sindresorhus/dev/callsites/test.js'
}

unicorn();
```

## API

Returns an array of callsite objects with the following methods:

- `getThis`: Returns the value of `this`.
- `getTypeName`: Returns the type of `this` as a string. This is the name of the function stored in the constructor field of `this`, if available, otherwise the object's `[[Class]]` internal property.
- `getFunction`: Returns the current function.
- `getFunctionName`: Returns the name of the current function, typically its `name` property. If a name property is not available an attempt will be made to try to infer a name from the function's context.
- `getMethodName`: Returns the name of the property of `this` or one of its prototypes that holds the current function.
- `getFileName`: If this function was defined in a script returns the name of the script.
- `getLineNumber`: If this function was defined in a script returns the current line number.
- `getColumnNumber`: If this function was defined in a script returns the current column number
- `getEvalOrigin`: If this function was created using a call to `eval` returns a string representing the location where `eval` was called.
- `isToplevel`: Is this a top-level invocation, that is, is this the global object?
- `isEval`: Does this call take place in code defined by a call to `eval`?
- `isNative`: Is this call in native V8 code?
- `isConstructor`: Is this a constructor call?

---

<div align="center">
	<b>
		<a href="https://tidelift.com/subscription/pkg/npm-callsites?utm_source=npm-callsites&utm_medium=referral&utm_campaign=readme">Get professional support for this package with a Tidelift subscription</a>
	</b>
	<br>
	<sub>
		Tidelift helps make open source sustainable for maintainers while giving companies<br>assurances about security, maintenance, and licensing for their dependencies.
	</sub>
</div>
