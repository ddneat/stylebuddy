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
  Object.keys(defaults).forEach(key => {
    currentConfig[key] = config.hasOwnProperty(key) ? config[key] : defaults[key];
  });
  return currentConfig;
};

const createProperty = (property, value) => `${property}:${value};`;
const createRuleSet = (selector, block) => (block !== '' ? `${selector}{${block}}` : '');
const convertCamelCase = input => input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const isPseudoSelector = property => property[0] === ':';
const isAtRule = property => property[0] === '@';

const renderProperties = (selector, atRuleNotAllowed) => (
  Object.keys(selector).map(property => {
    if (atRuleNotAllowed && isAtRule(property)) {
      throw new Error(AT_RULE_NESTED);
    }
    return createProperty(
      convertCamelCase(property),
      selector[property]
    );
  })
);

const renderPseudoSelectors = (pseudoSelectors, element) => (
  Object.keys(pseudoSelectors).map(selector => createRuleSet(
    element + selector,
    renderProperties(pseudoSelectors[selector], true)
  ))
);

const renderAtRules = (atRules, selector, config, selectorsMap) => (
  Object.keys(atRules).map(rule => createRuleSet(
    rule,
    render({ [selector]: atRules[rule] }, config, selectorsMap).style
  ))
);

const prepareBlock = block => {
  const pseudoSelectors = {};
  const atRules = {};
  const properties = {};

  Object.keys(block).forEach(property => {
    if (isPseudoSelector(property)) {
      pseudoSelectors[property] = block[property];
    } else if (isAtRule(property)) {
      atRules[property] = block[property];
    } else {
      properties[property] = block[property];
    }
  });

  return {
    properties,
    pseudoSelectors,
    atRules,
  };
};

const createDJB2 = str => {
  let i = str.length;
  let hash = 5381;
  while (i) hash = hash * 33 ^ str.charCodeAt(--i);
  return hash >>> 0;
};

const renderSelector = (selector, config, selectorsMap) => {
  const { prefix, hashSelector, appendHash, delimiter, salt } = config;
  const hashed = hashSelector ? createDJB2(selector + salt) : selector;
  const appended = appendHash ? `${hashed}${delimiter}${createDJB2(hashed + salt)}` : hashed;
  const delimited = `${delimiter}${appended}`;
  selectorsMap[selector] = delimited;
  return `${prefix}${delimited}`;
};

function render(obj, config, selectorsMap) {
  const style = Object.keys(obj).map(selector => {
    const { properties, pseudoSelectors, atRules } = prepareBlock(obj[selector]);
    const renderedSelector = renderSelector(selector, config, selectorsMap);
    return (
      createRuleSet(renderedSelector, renderProperties(properties).join('')) +
      renderPseudoSelectors(pseudoSelectors, renderedSelector).join('') +
      renderAtRules(atRules, selector, config, selectorsMap)
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
