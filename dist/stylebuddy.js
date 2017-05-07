'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var AT_RULE_NESTED = 'At-rule nested in pseudo selector';

var DEFAULT_CONFIG = {
  prefix: '.', // e.g.: enforce css classes
  delimiter: '_',
  salt: '',
  hashSelector: false,
  appendHash: true
};

var getMergedConfig = function getMergedConfig(config, defaults) {
  var currentConfig = {};
  Object.keys(defaults).forEach(function (key) {
    currentConfig[key] = config.hasOwnProperty(key) ? config[key] : defaults[key];
  });
  return currentConfig;
};

var createProperty = function createProperty(property, value) {
  return property + ':' + value + ';';
};
var createRuleSet = function createRuleSet(selector, block) {
  return block !== '' ? selector + '{' + block + '}' : '';
};
var prefixTitleCase = function prefixTitleCase(input) {
  return input.replace(/^([A-Z])/, '-$1');
};
var convertCamelCase = function convertCamelCase(input) {
  return input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
};

var renderProperties = function renderProperties(selector, atRuleNotAllowed) {
  return Object.keys(selector).map(function (property) {
    if (atRuleNotAllowed && property[0] === '@') {
      throw new Error(AT_RULE_NESTED);
    }
    var values = [].concat(selector[property]);
    var name = convertCamelCase(prefixTitleCase(property));
    return values.map(function (value) {
      return createProperty(name, value);
    }).join('');
  });
};

var renderPseudoSelectors = function renderPseudoSelectors(pseudoSelectors, element) {
  return Object.keys(pseudoSelectors).map(function (selector) {
    return createRuleSet(element + selector, renderProperties(pseudoSelectors[selector], true));
  });
};

var renderAtRules = function renderAtRules(atRules, selector, config, selectorsMap) {
  return Object.keys(atRules).map(function (rule) {
    return createRuleSet(rule, render(_defineProperty({}, selector, atRules[rule]), config, selectorsMap).style);
  });
};

var prepareBlock = function prepareBlock(block) {
  var types = { ':': {}, '@': {}, properties: {} };
  Object.keys(block).forEach(function (property) {
    var current = types[property[0]] || types.properties;
    current[property] = block[property];
  });
  return types;
};

var createDJB2 = function createDJB2(str) {
  var i = str.length;
  var hash = 5381;
  while (i) {
    hash = hash * 33 ^ str.charCodeAt(--i);
  }return hash >>> 0;
};

var renderSelector = function renderSelector(selector, config, selectorsMap) {
  var prefix = config.prefix,
      hashSelector = config.hashSelector,
      appendHash = config.appendHash,
      delimiter = config.delimiter,
      salt = config.salt;

  var hashed = hashSelector ? createDJB2(selector + salt) : selector;
  var appended = appendHash ? '' + hashed + delimiter + createDJB2(hashed + salt) : hashed;
  var delimited = '' + delimiter + appended;
  selectorsMap[selector] = delimited;
  return '' + prefix + delimited;
};

function render(obj, config, selectorsMap) {
  var style = Object.keys(obj).map(function (selector) {
    var block = prepareBlock(obj[selector]);
    var renderedSelector = renderSelector(selector, config, selectorsMap);
    return createRuleSet(renderedSelector, renderProperties(block.properties).join('')) + renderPseudoSelectors(block[':'], renderedSelector).join('') + renderAtRules(block['@'], selector, config, selectorsMap);
  }).join('');

  return {
    style: style,
    selectors: selectorsMap
  };
}

var create = function create() {
  var baseConfig = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var mergedBaseConfig = getMergedConfig(baseConfig, DEFAULT_CONFIG);
  var styles = [];

  return {
    add: function add(styleObj) {
      var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      var currentConfig = getMergedConfig(config, mergedBaseConfig);

      var _render2 = render(styleObj, currentConfig, {}),
          style = _render2.style,
          selectors = _render2.selectors;

      styles.push(style);
      return selectors;
    },
    render: function render() {
      return styles.join('');
    }
  };
};

module.exports = {
  create: create
};
