# concordance

Compare, format, diff and serialize any JavaScript value. Built for Node.js 10
and above.

## Behavior

Concordance recursively describes JavaScript values, whether they're booleans or
complex object structures. It recurses through all enumerable properties, list
items (e.g. arrays) and iterator entries.

The same algorithm is used when comparing, formatting or diffing values. This
means Concordance's behavior is consistent, no matter how you use it.

### Comparison details

* [Object wrappers](https://github.com/getify/You-Dont-Know-JS/blob/1st-ed/types%20%26%20grammar/ch3.md#boxing-wrappers)
  are compared both as objects and unwrapped values. Thus Concordance always
  treats `Object(1)` as different from `1`.
* `-0` is distinct from `0`.
* `NaN` equals `NaN`.
* The `Argument` values can be compared to a regular array.
* `Error` names and messages are always compared, even if these are not
  enumerable properties.
* `Function` values are compared by identity only. Names are always formatted
  and serialized.
* `Global` objects are considered equal.
* `Map` keys and `Set` items are compared in-order.
* `Object` string properties are compared according to the [traversal order](http://2ality.com/2015/10/property-traversal-order-es6.html).
  Symbol properties are compared by identity.
* `Promise` values are compared by identity only.
* `Symbol` values are compared by identity only.
* Recursion stops whenever a circular reference is encountered. If the same
  cycle is present in the actual and expected values they're considered equal,
  but they're unequal otherwise.

### Formatting details

Concordance strives to format every aspect of a value that is used for
comparisons. Formatting is optimized for human legibility.

Strings enjoy special formatting:

* When used as keys, line break characters are escaped
* Otherwise, multi-line strings are formatted using backticks, and line break
  characters are replaced by [control pictures](http://graphemica.com/blocks/control-pictures).

Similarly, line breaks in symbol descriptions are escaped.

### Diffing details

Concordance tries to minimize diff lines. This is difficult with object values,
which may have similar properties but a different constructor. Multi-line
strings are compared line-by-line.

### Serialization details

Concordance can serialize any value for later use. Deserialized values can be
compared to each other or to regular JavaScript values. The deserialized
value should be passed as the **actual** value to the comparison and diffing
methods. Certain value comparisons behave differently when the **actual** value
is deserialized:

* `Argument` values can only be compared to other `Argument` values.
* `Function` values are compared by name.
* `Promise` values are compared by their constructor and additional enumerable
  properties, but not by identity.
* `Symbol` values are compared by their string serialization. [Registered](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Shared_symbols_in_the_global_symbol_registry)
   and [well-known symbols](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Symbol#Well-known_symbols)
   will never equal symbols with similar descriptions.
