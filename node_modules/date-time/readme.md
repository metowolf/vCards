# date-time [![Build Status](https://travis-ci.org/sindresorhus/date-time.svg?branch=master)](https://travis-ci.org/sindresorhus/date-time)

> Pretty datetime: `2014-01-09 06:46:01`


## Install

```
$ npm install date-time
```


## Usage

```js
const dateTime = require('date-time');

dateTime();
//=> '2017-05-20 17:07:05'

dateTime({date: new Date(1989, 2, 4, 10)});
//=> '1989-03-04 09:00:00'

dateTime({showTimeZone: true});
//=> '2017-05-20 17:07:05 UTC+7'

dateTime({local: false});
//=> '2017-05-20 10:07:05'

dateTime({local: false, showTimeZone: true});
//=> '2017-05-20 10:07:05 UTC'

dateTime({showMilliseconds: true});
//=> '2017-05-20 17:07:05 6ms'
```


## API

### dateTime([options])

### options

Type: `Object`

#### date

Type: `Date`<br>
Default: `new Date()`

Custom date.

#### local

Type: `boolean`<br>
Default: `true`

Show the date in the local time zone.

#### showTimeZone

Type: `boolean`<br>
Default: `false`

Show the UTC time zone postfix.

#### showMilliseconds

Type: `boolean`<br>
Default: `false`

Show the milliseconds in the date if any.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
