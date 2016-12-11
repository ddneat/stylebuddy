# Stylebuddy 🐻

[![Build Status](https://travis-ci.org/davidspinat/stylebuddy.svg)](https://travis-ci.org/davidspinat/stylebuddy)

__Generate CSS from JSON without any additional dependencies:__

- Supports at-rules like `media queries`
- Supports pseudo selectors like `:hover`, `:focus`, `:before` etc.
- Supports selectors by tag, class and id (e.g.: `body,`, `.components`, `#component`)
- Can be used for server side rendering
- Converts camel case property names to hyphen notation
- No dependencies
- Tiny (<2kb, about 600bytes minified and gzipped)

## Example

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
const css = styleSheet.render();

const styleNode = document.createElement('style');
document.head.appendChild(styleNode);
domNode.textContent = css;
```
