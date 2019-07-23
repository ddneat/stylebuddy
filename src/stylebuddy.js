/**
 * Stylebuddy
 * Copyright (c) 2017 David Neubauer, @ddneat. https://ddne.at
 *
 * This source code is licensed under the ISC license found in the
 * LICENSE file in the root directory of this source tree.
 */

const AT_RULE_NESTED = 'At-rule nested in pseudo selector';

const DEFAULT_CONFIG = {
  prefix: '.', // e.g.: enforce css classes
  delimiter: '_',
  salt: '',
  hashSelector: false,
  appendHash: true,
};

const getMergedConfig = (config, defaults) => {
  const currentConfig = {};
  Object.keys(defaults).forEach((key) => {
    currentConfig[key] = config.hasOwnProperty(key) ? config[key] : defaults[key];
  });
  return currentConfig;
};

const createProperty = (property, value) => `${property}:${value};`;
const createRuleSet = (selector, block) => (block !== '' ? `${selector}{${block}}` : '');
const prefixTitleCase = input => input.replace(/^([A-Z])/, '-$1');
const convertCamelCase = input => input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

const renderProperties = (selector, atRuleNotAllowed) => (
  Object.keys(selector).map((property) => {
    if (atRuleNotAllowed && property[0] === '@') {
      throw new Error(AT_RULE_NESTED);
    }
    const values = [].concat(selector[property]);
    const name = convertCamelCase(prefixTitleCase(property));
    return values.map((value => createProperty(name, value))).join('');
  })
);

const renderPseudoSelectors = (pseudoSelectors, element) => (
  Object.keys(pseudoSelectors).map(selector => createRuleSet(
    element + selector,
    renderProperties(pseudoSelectors[selector], true).join(''),
  ))
);

const renderAtRules = (atRules, selector, config, selectorsMap) => (
  Object.keys(atRules).map(rule => createRuleSet(
    rule,
    render({ [selector]: atRules[rule] }, config, selectorsMap).style,
  ))
);

const prepareBlock = (block) => {
  const types = { ':': {}, '@': {}, properties: {} };
  Object.keys(block).forEach((property) => {
    const current = types[property[0]] || types.properties;
    current[property] = block[property];
  });
  return types;
};

const createDJB2 = (str) => {
  let i = str.length;
  let hash = 5381;
  while (i) hash = hash * 33 ^ str.charCodeAt(--i);
  return hash >>> 0;
};

const renderSelector = (selector, config, selectorsMap) => {
  const {
    prefix, hashSelector, appendHash, delimiter, salt,
  } = config;
  const hashed = hashSelector ? createDJB2(selector + salt) : selector;
  const appended = appendHash ? `${hashed}${delimiter}${createDJB2(hashed + salt)}` : hashed;
  const delimited = `${delimiter}${appended}`;
  selectorsMap[selector] = delimited;
  return `${prefix}${delimited}`;
};

function render(obj, config, selectorsMap) {
  const style = Object.keys(obj).map((selector) => {
    const block = prepareBlock(obj[selector]);
    const renderedSelector = renderSelector(selector, config, selectorsMap);
    return (
      createRuleSet(renderedSelector, renderProperties(block.properties).join(''))
      + renderPseudoSelectors(block[':'], renderedSelector).join('')
      + renderAtRules(block['@'], selector, config, selectorsMap)
    );
  }).join('');

  return {
    style,
    selectors: selectorsMap,
  };
}

const create = (baseConfig = {}) => {
  const mergedBaseConfig = getMergedConfig(baseConfig, DEFAULT_CONFIG);
  const styles = [];

  return {
    add: (styleObj, config = {}) => {
      const currentConfig = getMergedConfig(config, mergedBaseConfig);
      const { style, selectors } = render(styleObj, currentConfig, {});
      styles.push(style);
      return selectors;
    },
    render: () => styles.join(''),
  };
};

module.exports = {
  create,
};
