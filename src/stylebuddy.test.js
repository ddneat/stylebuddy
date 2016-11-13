const assert = require('assert');
const stylebuddy = require('./stylebuddy');

test('api.render returns the parsed css', () => {
  const input = {
    body: {
      background: 'black',
    },
  };

  assert.equal(stylebuddy.create(input).render(), 'body{background:black;}');
});

test('api.render supports pseudo selectors', () => {
  const input = {
    button: {
      background: 'yellow',
      ':hover': {
        background: 'blue',
      },
    },
  };

  assert.equal(
    stylebuddy.create(input).render(),
    'button{background:yellow;}button:hover{background:blue;}'
  );
});

test('api.render converts camel case properties into dash hyphen', () => {
  const input = {
    button: {
      background: '#fff',
      borderColor: 'black',
    },
  };

  assert.equal(stylebuddy.create(input).render(), 'button{background:#fff;border-color:black;}');
});

test('api.render supports media queries', () => {
  const input = {
    body: {
      '@media screen and (min-width:720px)': {
        background: 'black',
      },
    },
  };

  assert.equal(
    stylebuddy.create(input).render(),
    '@media screen and (min-width:720px){body{background:black;}}'
  );
});

test('api.render throws when media queries are nested within a pseudo selector', () => {
  const input = {
    body: {
      ':hover': {
        '@media screen and (min-width:720px)': {
          background: 'black',
        },
      },
    },
  };

  assert.throws(() => stylebuddy.create(input).render(), /At-rule nested in pseudo selector/);
});

test('api.render supports media queries containing a pseudo selector', () => {
  const input = {
    body: {
      '@media screen and (min-width:720px)': {
        ':hover': {
          background: 'black',
        },
      },
    },
  };

  assert.equal(
    stylebuddy.create(input).render(),
    '@media screen and (min-width:720px){body:hover{background:black;}}'
  );
});

test('api.render supports nested media queries', () => {
  const input = {
    body: {
      '@media screen': {
        background: 'black',
        '@media (min-width:700px)': {
          background: 'red',
        },
      },
    },
  };

  assert.equal(
    stylebuddy.create(input).render(),
    '@media screen{body{background:black;}@media (min-width:700px){body{background:red;}}}'
  );
});
