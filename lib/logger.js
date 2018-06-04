'use strict';

var winston = require('winston');
var config = require('../config');
var prod = (config.env === 'production');

var levels = {
  error: 0,
  warn: 1,
  info: 2,
  email: 3,
  debug: 4,
};

var colors = {
  info: 'green',
  debug: 'blue',
  email: 'magenta',
  warn: 'yellow',
  error: 'red'
};

const getIp = req => {
  let ip;
  try {
    ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
  } catch (e) {
    ip = false;
  }
  return ip;
};

const getMeta = req => {
  let meta = {};

  if (req && req.signedCookies && req.signedCookies['connect.sid']) {
    meta.session = req.signedCookies['connect.sid'];
  }

  meta.ip = getIp(req);

  return meta;
};

const logFormat = obj => {
  let sid = '[nosession]';
  let ip = '[noip]';

  if (obj.meta) {
    if (obj.meta.session) {
      sid = `[${obj.meta.session.slice(-10, -1)}]`;
    }
    if (obj.meta.ip) {
      ip = `[${obj.meta.ip}]`;
    }
  }

  return [
    `[evw-customer-hof]`,
    `[${obj.level}]`,
    `${obj.timestamp()}`,
    `${sid}`,
    `${ip}`,
    obj.message,
    obj.meta.stack
  ].join(' ');
};

const prodlog = new winston.transports.Console({
  timestamp: () => new Date().toISOString(),
  formatter: logFormat,
  handleExceptions: true
});

const devlog = new winston.transports.Console({
  timestamp: () => new Date().toISOString(),
  prettyPrint: true,
  colorize: true
});

const log = prod ? prodlog : devlog;

const transports = {
  levels: levels,
  transports: [
    log
  ]
};

// Shut up mocha!
if (config.env === 'test') {
  delete transports.transports;
}

let logger = new (winston.Logger)(transports);

logger.on('error', err => console.error(err));
winston.setLevels(levels);
winston.addColors(colors);

module.exports = logger;
module.exports.getIp = getIp;
module.exports.getMeta = getMeta;
