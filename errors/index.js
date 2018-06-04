'use strict';

var path = require('path');
var hof = require('hof');
var i18n = hof.i18n({
  path: path.resolve(__dirname, '../apps/common/translations/__lng__/__ns__.json')
});
var config = require('../config');
var logger = require('../lib/logger');

/* eslint no-unused-vars: 0*/
module.exports = function errorHandler(err, req, res, next) {
  /* eslint no-unused-vars: 1*/
  var content = {};
  if (err.code === 'SESSION_TIMEOUT') {
    content.title = i18n.translate('errors.session.title');
    content.message = i18n.translate('errors.session.message');
  }

  if (err.code === 'NO_COOKIES') {
    err.status = 403;
    content.title = i18n.translate('errors.cookies-required.title');
    content.message = i18n.translate('errors.cookies-required.message');
  }

  let error = {
    message: err,
    template: 'error'
  };
  let startLink = req.sessionModel && req.sessionModel.get('startLink');
  if (req.sessionModel && process.env.NODE_ENV !== 'development') {
    req.sessionModel.reset();
  }
  content.title = content.title || i18n.translate('errors.default.title');
  content.message = content.message || i18n.translate('errors.default.message');

  res.statusCode = err.status || 500;

  logger.error('error from index', err);
  logger.error('error from index', logger.getMeta(req));
  res.render(error.template, {
    error: error.message,
    content: content,
    showStack: (config.env === 'development' || config.env === 'docker-compose'),
    startLink: startLink ? [
      req.path.replace(/^\/([^\/]*).*$/, '$1'),
      startLink
    ].join('/') : req.path.replace(/^\/([^\/]*).*$/, '$1')
  });
};
