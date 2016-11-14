# Stylebuddy 🐻

[![Build Status](https://travis-ci.org/davidspinat/stylebuddy.svg)](https://travis-ci.org/davidspinat/stylebuddy)

Generate CSS from JSON

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

const buddy = stylebuddy.create(input);
const css = buddy.render();

const styleNode = document.createElement('style');
document.head.appendChild(styleNode);
domNode.textContent = css;
```
