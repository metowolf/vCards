export interface TimeComponents {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	milliseconds: number;
	microseconds: number;
	nanoseconds: number;
}

/**
Parse milliseconds into an object.

@example
```
import parseMilliseconds from 'parse-ms';

parseMilliseconds(1337000001);
// {
// 	days: 15,
// 	hours: 11,
// 	minutes: 23,
// 	seconds: 20,
// 	milliseconds: 1,
// 	microseconds: 0,
// 	nanoseconds: 0
// }
```
*/
export default function parseMilliseconds(milliseconds: number): TimeComponents;
