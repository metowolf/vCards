<h1 align="center">
	<br>
	<img width="300" src="media/logo.png" alt="SUPERTAP">
	<br>
	<br>
	<br>
</h1>

[![Build Status](https://travis-ci.org/vadimdemedes/supertap.svg?branch=master)](https://travis-ci.org/vadimdemedes/supertap)

> Generate TAP output


## Install

```
$ npm install supertap
```


## Usage

```js
import * as supertap from 'supertap';

console.log(supertap.start());

console.log(supertap.test('passing', {
	index: 1,
	passed: true
}));

console.log(supertap.finish({
	passed: 1
}));
```

Output:

```
TAP version 13
# passing
ok 1 - passing

1..1
# tests 1
# pass 1
# fail 0
```


## API

### start()

Always returns `'TAP version 13'` string.

### test(title, options)

#### title

Type: `string`

Test title.

#### options

##### index

Type: `number`

Index of the test. Should start with one, not zero.

##### passed

Type: `boolean`<br>
Default: `false`

Status of the test.

##### error

Type: `Error` `object`

If test has failed (`passed` is `false`), `error` should be an instance of an actual error.
It can also be an object, which fields will be included in the output (e.g. `name`, `message`, `actual`, `expected`).

```js
supertest.test('failing', {
	index: 1,
	passed: false,
	error: new Error()
});
```

##### todo
##### skip

Type: `boolean`<br>
Default: `false`

Mark test as to-do or as skipped.

##### comment

Type: `string` `array`

Comments for that test.

### finish(stats)

#### stats

##### passed
##### failed
##### skipped
##### todo
##### crashed

Type: `number`<br>
Default: `0`

Number of tests that passed, failed, skipped or marked as todo. `crashed` is a special option, which adds to failed test count in the output, but not total test count. AVA uses it to count unhandled exceptions.
