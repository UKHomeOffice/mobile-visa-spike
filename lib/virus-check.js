'use strict';

let exec = require('child_process').exec;
const logger = require('../lib/logger');

module.exports = function scan(file, callback) {

  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
    return callback();
  }

  exec('viruscheck ' + file, (err, stdout, stderr) => {
    logger.info('ClamAV scan results:', stdout);
    logger.error(`Errors encountered while performing virus check: ${stderr}`);

    if (err) {
      logger.error('Error: ⚠ virus check error', err);
    }
  }).on('exit', (code, signal) => {
    if (code === 0) {
      return callback();
    }

    if (signal) {
      const err = new Error(`Virus scan interrupted. Received signal: ${signal}`);
      logger.error(err);
      return callback(err);
    }

    const error = new Error('Passport image contains a virus');
    error.status = 400;
    logger.error(error);
    return callback(error);
  });

};
