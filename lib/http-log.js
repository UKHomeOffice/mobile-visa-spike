'use strict';

const config = require('../config');
const morgan = require('morgan');

// log out connect id
morgan.token('cid', req => {
  let sid = '';
  if (req && req.signedCookies) {
    let csid = req.signedCookies['connect.sid'];
    sid = csid ? csid.slice(-10) : '';
  }
  return sid;
});

// log ip address
morgan.token('ip', req =>
  req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip);

module.exports = morgan((tokens, req, res) => [
  `[${config.appName}]`,
  `[debug]`,
  tokens.date(req, res, 'iso'),
  `[${tokens.cid(req)}]`,
  `[${tokens.ip(req)}]`,
  tokens.method(req, res),
  tokens.url(req, res),
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'),
  `${tokens['response-time'](req, res)}ms`
].join(' '));
