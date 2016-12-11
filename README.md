# Stylebuddy 🐻

[![Build Status](https://travis-ci.org/davidspinat/stylebuddy.svg)](https://travis-ci.org/davidspinat/stylebuddy)

__Generate CSS from JSON without any additional dependencies:__

- Supports at-rules like `media queries`
- Supports pseudo selectors like `:hover`, `:focus`, `:before` etc.
- Supports selectors by tag, class and id (e.g.: `body,`, `.components`, `#component`)
- Can be used for server side rendering
- Converts camel case property names to hyphen notation
- No dependencies
- Tiny (2kb, about 860bytes uglified and gzipped)

## Basic Example

```javascript
import stylebuddy from 'stylebuddy';

const desktop = '@media screen and (min-width:720px)';

const input = {
  component: {
    background: '#ccc',
    ':hover': {
      background: '#777'
    },
    [desktop]: {
      fontSize: 20,
      ':hover': {
        background: '#333'
      }
    }
  }
};

const styleSheet = stylebuddy.create();
styleSheet.add(input);
const css = styleSheet.render(); // ._component{background:#ccc;}.component:hover{background:#777;}@media ...

const styleNode = document.createElement('style');
document.head.appendChild(styleNode);
domNode.textContent = css;
```

## API

### `create([, config])`

Returns the styleSheet API. The optional config sets the default config values for the current instance.

### `styleSheet.add(styles[, config])`

The passed config will be merged with the current instance config.

### `styleSheet.render()`

Returns the CSS string from the passes styles.

## Configuration

```javascript
const DEFAULT_CONFIG = {
  prefix: '.', // e.g.: enforce css classes
  delimiter: '_',
  salt: '',
  hashSelector: false,
  appendHash: true,
};
```

## Stylesheet Config

```javascript
import stylebuddy from 'stylebuddy';

const styleSheetConfig = {
  delimiter: '___',
  appendHash: false
};

const styles = {
  components: {
    background: '#ccc'
  }
};

const styleSheet = stylebuddy.create(styleSheetConfig);

styleSheet.add(styles);

const css = styleSheet.render(); // .___components{background:#ccc;}

const styleNode = document.createElement('style');
document.head.appendChild(styleNode);
domNode.textContent = css;
```

## Tag Selector

```javascript
import stylebuddy from 'stylebuddy';

const tagSelector = {
  body: {
    background: '#ccc'
  }
};

const styleSheet = stylebuddy.create();

styleSheet.add(tagSelector, { delimiter: '', prefix: '', appendHash: false });

const css = styleSheet.render(); // body{background:#ccc;}

const styleNode = document.createElement('style');
document.head.appendChild(styleNode);
domNode.textContent = css;
```

## Id Selector

```javascript
import stylebuddy from 'stylebuddy';

const idSelector = {
  component: {
    background: '#333'
  }
};

const styleSheet = stylebuddy.create();

styleSheet.add(idSelector, { prefix: '#', appendHash: false });

const css = styleSheet.render(); // #_component{background:#333;}

const styleNode = document.createElement('style');
document.head.appendChild(styleNode);
domNode.textContent = css;
```

## Flexible Stylesheet

```javascript
import stylebuddy from 'stylebuddy';

const tagSelectors = {
  body: {
    background: '#ccc'
  }
};

const classSelectors = {
  components: {
    background: '#999'
  }
};

const idSelectors = {
  component: {
    background: '#333'
  }
};

const styleSheetConfig = {
  appendHash: false
};

const styleSheet = stylebuddy.create(styleSheetConfig);

styleSheet.add(tagSelectors, { prefix: '', delimiter: '' });
styleSheet.add(classSelectors, { delimiter: '___' });
styleSheet.add(idSelectors, { prefix: '#' });

const css = styleSheet.render(); // body{background:#ccc;}.___components{background:#999;}#_component{background:#333;}

const styleNode = document.createElement('style');
document.head.appendChild(styleNode);
domNode.textContent = css;
```
