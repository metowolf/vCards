'use strict';

var test = require('tape');
var vm = require('vm');

var isError = require('../index.js');

test('isError is a function', function t(assert) {
    assert.equal(typeof isError, 'function');
    assert.end();
});

test('returns true for error', function t(assert) {
    assert.equal(isError(new Error('foo')), true);
    assert.equal(isError(Error('foo')), true);
    assert.end();
});

test('returns false for non-error', function t(assert) {
    assert.equal(isError(null), false);
    assert.equal(isError(undefined), false);
    assert.equal(isError({message: 'hi'}), false);
    assert.equal(isError(true), false);
    assert.equal(isError(false), false);
    assert.equal(isError(1), false);
    assert.equal(isError('string'), false);
    assert.end();
});

test('errors that inherit from Error', function t(assert) {
    var error = Object.create(new Error());
    assert.equal(isError(error), true);
    assert.end();
});

test('errors from other contexts', function t(assert) {
    var error = vm.runInNewContext('new Error()');
    assert.equal(isError(error), true);
    assert.end();
});

test('errors that inherit from Error in another context', function t(assert) {
    var error = vm.runInNewContext('Object.create(new Error())');
    assert.equal(isError(error), true);
    assert.end();
});
