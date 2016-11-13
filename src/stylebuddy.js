const AT_RULE_NESTED = 'At-rule nested in pseudo selector';

const createProperty = (property, value) => `${property}:${value};`;
const createRuleSet = (selector, block) => (block !== '' ? `${selector}{${block}}` : '');
const convertCamelCase = input => input.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
const isPropertyPseudoSelector = property => property[0] === ':';
const isAtRule = property => property[0] === '@';

const renderStyleProperties = (selector, atRuleNotAllowed) => (
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
    renderStyleProperties(pseudoSelectors[selector], true)
  ))
);

const renderAtRules = (atRules, selector) => (
  Object.keys(atRules).map(rule => createRuleSet(
    rule,
    render({ [selector]: atRules[rule] })
  ))
);

const prepareBlock = block => {
  const pseudoSelectors = {};
  const atRules = {};
  const styleProperties = {};

  Object.keys(block).forEach(property => {
    if (isPropertyPseudoSelector(property)) {
      pseudoSelectors[property] = block[property];
    } else if (isAtRule(property)) {
      atRules[property] = block[property];
    } else {
      styleProperties[property] = block[property];
    }
  });

  return {
    styleProperties,
    pseudoSelectors,
    atRules,
  };
};

function render(obj) {
  return Object.keys(obj).map(selector => {
    const { styleProperties, pseudoSelectors, atRules } = prepareBlock(obj[selector]);
    return (
      createRuleSet(selector, renderStyleProperties(styleProperties).join('')) +
      renderPseudoSelectors(pseudoSelectors, selector).join('') +
      renderAtRules(atRules, selector)
    );
  }).join('');
}

const create = (style) => ({
  render: () => render(style),
});

module.exports = {
  create,
};
