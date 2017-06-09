const test = require('tropic');
const assert = require('assert');
const stylebuddy = require('./stylebuddy');

test('add returns the rendered selectors', () => {
  const input = {
    app: {
      background: 'blue',
    },
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });

  assert.deepEqual(
    styleSheet.add(input),
    { app: '_app', component: '_component' }
  );
});

test('add returns the rendered selectors with delimiter', () => {
  const input = {
    app: {
      background: 'blue',
    },
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false, delimiter: '___' });

  assert.deepEqual(
    styleSheet.add(input),
    { app: '___app', component: '___component' }
  );
});

test('add returns the rendered selectors supporting tag selectors', () => {
  const input = {
    body: {
      background: 'blue',
    },
    button: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false, delimiter: '' });

  assert.deepEqual(
    styleSheet.add(input),
    { body: 'body', button: 'button' }
  );
});

test('add returns the rendered selectors with appendHash', () => {
  const input = {
    app: {
      background: 'blue',
    },
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: true });

  assert.deepEqual(
    styleSheet.add(input),
    { app: '_app_193425604', component: '_component_2513881194' }
  );
});

test('add returns the rendered selectors with appendHash and salt', () => {
  const input = {
    app: {
      background: 'blue',
    },
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: true, salt: 'buddy' });

  assert.deepEqual(
    styleSheet.add(input),
    { app: '_app_3136795498', component: '_component_1892634500' }
  );
});

test('add returns the rendered selectors with appendHash and delimiter', () => {
  const input = {
    app: {
      background: 'blue',
    },
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: true, delimiter: '___' });

  assert.deepEqual(
    styleSheet.add(input),
    { app: '___app___193425604', component: '___component___2513881194' }
  );
});

test('add returns the rendered selectors with hashSelector', () => {
  const input = {
    app: {
      background: 'blue',
    },
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false, hashSelector: true });

  assert.deepEqual(
    styleSheet.add(input),
    { app: '_193425604', component: '_2513881194' }
  );
});

test('add returns the rendered selectors with hashSelector and salt', () => {
  const input = {
    app: {
      background: 'blue',
    },
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false, hashSelector: true, salt: 'buddy' });

  assert.deepEqual(
    styleSheet.add(input),
    { app: '_3136795498', component: '_1892634500' }
  );
});

test('add throws when media queries are nested within a pseudo selector', () => {
  const input = {
    app: {
      ':hover': {
        '@media screen and (min-width:720px)': {
          background: 'black',
        },
      },
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });

  assert.throws(
    () => styleSheet.add(input),
    /At-rule nested in pseudo selector/
  );
});

test('render returns the parsed css', () => {
  const input = {
    app: {
      background: 'black',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input);

  assert.equal(styleSheet.render(), '._app{background:black;}');
});

test('render returns the parsed css with multiple add calls', () => {
  const input = {
    app: {
      background: 'black',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input, { prefix: '#' });
  styleSheet.add(input, { delimiter: '__' });

  assert.equal(styleSheet.render(), '#_app{background:black;}.__app{background:black;}');
});

test('render supports pseudo selectors', () => {
  const input = {
    component: {
      background: 'yellow',
      ':hover': {
        background: 'blue',
        color: 'black',
      },
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '._component{background:yellow;}._component:hover{background:blue;color:black;}'
  );
});

test('render converts camel case properties into dash hyphen', () => {
  const input = {
    component: {
      background: '#fff',
      borderColor: 'black',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '._component{background:#fff;border-color:black;}'
  );
});

test('render duplicates properties when the value is an array', () => {
  const input = {
    component: {
      display: ['-webkit-box', '-moz-box'],
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '._component{display:-webkit-box;display:-moz-box;}'
  );
});

test('render prefixes title case properties with a hyphen', () => {
  const input = {
    component: {
      WebkitTransition: '200ms all linear',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '._component{-webkit-transition:200ms all linear;}'
  );
});

test('render supports media queries', () => {
  const input = {
    app: {
      '@media screen and (min-width:720px)': {
        background: 'black',
      },
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '@media screen and (min-width:720px){._app{background:black;}}'
  );
});

test('render supports media queries containing a pseudo selector', () => {
  const input = {
    app: {
      '@media screen and (min-width:720px)': {
        ':hover': {
          background: 'black',
        },
      },
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '@media screen and (min-width:720px){._app:hover{background:black;}}'
  );
});

test('render supports nested media queries', () => {
  const input = {
    app: {
      '@media screen': {
        background: 'black',
        '@media (min-width:700px)': {
          background: 'red',
        },
      },
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '@media screen{._app{background:black;}@media (min-width:700px){._app{background:red;}}}'
  );
});

test('render integration example with breakpoints', () => {
  const desktop = '@media screen and (min-width:720px)';

  const input = {
    component: {
      background: '#ccc',
      ':hover': {
        background: '#777',
      },
      [desktop]: {
        fontSize: 20,
        ':hover': {
          background: '#333',
        },
      },
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '._component{background:#ccc;}._component:hover{background:#777;}' +
    '@media screen and (min-width:720px){._component{font-size:20;}' +
    '._component:hover{background:#333;}}'
  );
});

test('render integration example with multiple add calls', () => {
  const firstInput = {
    app: {
      background: 'red',
    },
  };

  const secondInput = {
    component: {
      background: 'blue',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false });
  styleSheet.add(firstInput);
  styleSheet.add(secondInput);

  assert.equal(
    styleSheet.render(),
    '._app{background:red;}._component{background:blue;}'
  );
});

test('render integration example with configured delimiter', () => {
  const input = {
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false, delimiter: '___' });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '.___component{background:red;}'
  );
});

test('render integration example with configured appendHash', () => {
  const input = {
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: true });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '._component_2513881194{background:red;}'
  );
});

test('render integration example with configured appendHash and salt', () => {
  const input = {
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: true, salt: 'buddy' });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '._component_1892634500{background:red;}'
  );
});

test('render integration example with configured appendHash and delimiter', () => {
  const input = {
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: true, delimiter: '___' });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '.___component___2513881194{background:red;}'
  );
});

test('render integration example with configured hashSelector', () => {
  const input = {
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false, hashSelector: true });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '._2513881194{background:red;}'
  );
});

test('render integration example with configured hashSelector and salt', () => {
  const input = {
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false, hashSelector: true, salt: 'buddy' });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '._1892634500{background:red;}'
  );
});

test('render integration example with configured prefix id selector', () => {
  const input = {
    component: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false, prefix: '#' });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    '#_component{background:red;}'
  );
});

test('render integration example supporting tag selectors', () => {
  const input = {
    body: {
      background: 'red',
    },
  };

  const styleSheet = stylebuddy.create({ appendHash: false, prefix: '', delimiter: '' });
  styleSheet.add(input);

  assert.equal(
    styleSheet.render(),
    'body{background:red;}'
  );
});
