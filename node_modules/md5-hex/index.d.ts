/// <reference types="node"/>

/**
Create a MD5 hash with hex encoding.

@param data - Prefer buffers as they're faster to hash, but strings can be useful for small things.

Pass an array instead of concatenating strings and/or buffers. The output is the same, but arrays do not incur the overhead of concatenation.

@example
```
import * as fs from 'fs';
import md5Hex = require('md5-hex');

const buffer = fs.readFileSync('unicorn.png');

md5Hex(buffer);
//=> '1abcb33beeb811dca15f0ac3e47b88d9'
```
*/
declare function md5Hex(data: Buffer | string | ReadonlyArray<Buffer | string>): string;

export = md5Hex;
