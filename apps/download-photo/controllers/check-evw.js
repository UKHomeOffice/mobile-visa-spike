'use strict';

const EvwBaseController = require('../../common/controllers/evw-base');
const is = require(`${__base}/config`).integrationService;
const request = require('request-promise');
const logger = require(`../../../lib/logger`);

module.exports = class CheckEvwController extends EvwBaseController {

  numberAndToken(req) {
    return {
      number: req.params.evwNumber,
      token: req.params.token
    };
  }

  getValues(req, res, callback) {
    const nt = this.numberAndToken(req);
    req.sessionModel.set('numberAndToken', nt);
    return this.validateEvwCredentials(req, res)
    .then(this.checkError)
    .then(super.getValues.bind(this, req, res, callback))
    .catch((err) => this.renderError(err, res));
  }

  validateEvwCredentials(req) {
    const method = is.check.method.toLowerCase();
    const nt = this.numberAndToken(req);
    return request[method]({
      url: `${is.url}/${is.check.endpoint}/${nt.number}/${nt.token}`,
      json: true,
      timeout: is.timeout
    });
  }

  checkError(result) {
    let opt = result.error ? 'reject' : 'resolve';
    return Promise[opt](result.error);
  }

  renderError(err, res) {
    return res.status(403).render(`${__base}/apps/download/views/error`, {
      description: err
    });
  }

  // Check integration service to see
  // if information matches our records
  checkEvw(req) {
    const nt = this.numberAndToken(req);
    const number = nt.number;
    const token = nt.token;
    const method = is.download.method.toLowerCase();
    const vals = req.form.values;
    const json = {
      passportNumber: vals['passport-number'],
      dob: vals['date-of-birth-formatted']
    };

    logger.info(`checking evw ${number} with token ${token}, ${method}: ${JSON.stringify(json)}`,
      logger.getMeta(req)
    );

    return request[method]({
      url: `${is.url}/${is.download.endpoint}/${number}/${token}`,
      json: json,
      timeout: is.timeout
    });
  }

  process(req, res, callback) {
    return super.process(req, res, () => {
      return this.checkEvw(req)
      .then(result => {
        req.sessionModel.set('evw-details', result);
        callback();
      })
      .catch(reason => {
        if (reason.statusCode === 400) {
          logger.info('check-evw mismatch', reason.error.error, logger.getMeta(req));
          req.downloadError = reason.error.error;
        } else {
          logger.error('check-evw error', reason);
        }
        callback();
      });
    });
  }

  validateField(keyToValidate, req) {
    let error;
    if (keyToValidate === 'passport-number' && req.downloadError) {
      error = new this.ValidationError('passport-number', {
        type: req.downloadError
      });
    } else {
      error = super.validateField(keyToValidate, req);
    }
    return error;
  }

  locals(req, res) {
    const nt = this.numberAndToken(req);
    return Object.assign({
      EXTRA_NAV_URL: `/evw/${nt.number}/${nt.token}`
    }, super.locals(req, res));
  }

};
