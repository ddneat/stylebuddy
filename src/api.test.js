const assert = require('assert');
const createApi = require('./api');

test('api.render returns the parsed css', () => {
  const api = createApi();
  const input = {
    body: {
      background: 'black'
    }
  };

  assert.deepEqual(api.render(input), 'body{background:"black";}');
});
