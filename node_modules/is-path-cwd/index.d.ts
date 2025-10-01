/**
Check if a path is the [current working directory](https://en.wikipedia.org/wiki/Working_directory).

@example
```
import isPathCwd from 'is-path-cwd';

isPathCwd(process.cwd());
//=> true

isPathCwd('unicorn');
//=> false
```
*/
export default function isPathCwd(path: string): boolean;
