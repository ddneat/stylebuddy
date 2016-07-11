const assert = require('assert');
const createApi = require('./api');

test('createApi returns true', () => {
  assert.ok(createApi());
});
