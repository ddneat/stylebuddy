const renderProperties = (selector) => (
  Object.keys(selector).map((property) => `${property}:"${selector[property]}";`)
);

const render = (obj) => (
  Object.keys(obj).map((selector) => {
    const properties = renderProperties(obj[selector]);
    return `${selector}{${properties}}`;
  }).join('')
);

module.exports = () => ({
  render
});
