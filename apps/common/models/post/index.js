'use strict';

const rp = require('request-promise');

function post(data, options) {
  if (!data || !options) {
    return Promise.reject(new Error('Data and options must be supplied to the post function'));
  }
  if (!options.method || !options.uri || !options.endpoint) {
    return Promise.reject(new Error('Options must include uri, endpoint and method'));
  }
  const requestOptions = {
    method: options.method,
    uri: options.uri + options.endpoint,
    body: data,
    json: true
  };
  return rp(requestOptions)
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject(err));
}

module.exports = post;
