# time-zone [![Build Status](https://travis-ci.org/sindresorhus/time-zone.svg?branch=master)](https://travis-ci.org/sindresorhus/time-zone)

> Pretty [time zone](https://en.wikipedia.org/wiki/Time_zone): `+2` or `-9:30`


## Install

```
$ npm install --save time-zone
```


## Usage

```js
const timeZone = require('time-zone');

// current time zone (in Norway)
timeZone();
//=> '+2'

// time zone in February (in Norway)
timeZone(new Date(2016, 1, 1));
//=> '+1'

// current time zone (in French Polynesia)
timeZone();
//=> '-9:30'
```


## API

### timeZone([date])

#### date

Type: `Date`<br>
Default: `new Date()`

Custom date.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
