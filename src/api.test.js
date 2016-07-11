const assert = require('assert');
const mocha = require('mocha');

const createApi = require('./api');

test('createApi returns true', () => {
  assert.ok(createApi());
});
