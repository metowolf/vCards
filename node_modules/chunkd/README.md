# chunkd

> Get a chunk of an array based on the total number of chunks and current index

## Install

```sh
yarn add [--dev] chunkd
```

## Example

```js
const chunkd = require("chunkd")

chunkd([1, 2, 3, 4], 0, 3) // [1, 2]
chunkd([1, 2, 3, 4], 1, 3) // [3]
chunkd([1, 2, 3, 4], 2, 3) // [4]
```
