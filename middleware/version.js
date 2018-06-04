'use strict';

const router = require('express').Router();
const config = require('../config');
const getAppVersion = () => require('fs')
  .readFileSync(__base + '/version.conf', 'utf8')
  .match(/"(.*?)"/)[1];

const version = (req, res) => res.send({
  application: config.appName,
  version: getAppVersion()
});

router.get('/version', version);

module.exports = router;
module.exports.getAppVersion = getAppVersion;
