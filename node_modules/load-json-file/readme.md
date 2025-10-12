# load-json-file

> Read and parse a JSON file

It also [strips UTF-8 BOM](https://github.com/sindresorhus/strip-bom).

## Install

```
$ npm install load-json-file
```

## Usage

```js
import {loadJsonFile} from 'load-json-file';

console.log(await loadJsonFile('foo.json'));
//=> {foo: true}
```

## API

### loadJsonFile(filePath, options?)

Returns a `Promise<unknown>` with the parsed JSON.

### loadJsonFileSync(filepath, options?)

Returns the parsed JSON.

#### options

Type: `object`

##### beforeParse

Type: `Function`

Applies a function to the JSON string before parsing.

##### reviver

Type: `Function`

Prescribes how the value originally produced by parsing is transformed, before being returned. See the [`JSON.parse` docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Using_the_reviver_parameter) for more.

## load-json-file for enterprise

Available as part of the Tidelift Subscription.

The maintainers of load-json-file and thousands of other packages are working with Tidelift to deliver commercial support and maintenance for the open source dependencies you use to build your applications. Save time, reduce risk, and improve code health, while paying the maintainers of the exact dependencies you use. [Learn more.](https://tidelift.com/subscription/pkg/npm-load-json-file?utm_source=npm-load-json-file&utm_medium=referral&utm_campaign=enterprise&utm_term=repo)

## Related

- [write-json-file](https://github.com/sindresorhus/write-json-file) - Stringify and write JSON to a file atomically
