const React = require('react');
const handler = { get: (_, prop) => () => React.createElement('span', { 'data-icon': prop }) };
module.exports = new Proxy({}, handler);