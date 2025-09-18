'use strict';

var objectToString = Object.prototype.toString;
var getPrototypeOf = Object.getPrototypeOf;
var ERROR_TYPE = '[object Error]';

module.exports = function isError(err) {
    if (typeof err !== 'object') {
        return false;
    }
    if (err instanceof Error) {
        // Accept `AssertionError`s from the `assert` module that ships
        // with Node.js v6.1.0, compare issue #4.
        return true;
    }
    while (err) {
        if (objectToString.call(err) === ERROR_TYPE) {
            return true;
        }
        err = getPrototypeOf(err);
    }
    return false;
};
