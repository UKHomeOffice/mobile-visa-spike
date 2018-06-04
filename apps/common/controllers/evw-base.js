'use strict';

const _ = require('lodash');
const striptags = require('striptags');
const BaseController = require('hof-form-controller');
const formatting = require('../../../lib/formatting');
const Translation = require('../../../lib/translation');
const translation = new Translation('');
const config = require('../../../config');
const logger = require('../../../lib/logger');
const Evw = require('../models/evw');

module.exports = class EvwBaseController extends BaseController {

  constructor(settings) {
    super(settings);
    this.dateKeys = settings.options && settings.options.dateKeys || [];
    this.timeKeys = settings.options && settings.options.timeKeys || [];
    this.overridableTypeaheadKeys = settings.options && settings.options.overridableTypeaheadKeys || [];
    this.dependentFields = settings.options && settings.options.dependentFields;
    this.evw = new Evw({
      collectionName: config.mongo.collectionName,
      transform: require('evw-schemas').evw.hof.transform,
      schema: require('evw-schemas').evw.mainForm.schema,
      post: require('../models/post'),
      product: config.product,
      integrationService: {
        uri: config.integrationService.url,
        endpoint: config.integrationService.submission.endpoint,
        method: config.integrationService.submission.method
      }
    });
  }

  getNextStep (req, res) {
    this.confirmStep = '/check-your-answers';
    return super.getNextStep(req, res);
  }

  static isUsingGovpay(req) {
    return !!((config.allowGovPayOverride && req.cookies && req.cookies.govpayOverride) ||
      config.paymentService === 'govpay');
  }

  static isValidGovpayPayment(req) {
    // each time a new payment is created, a new orderCode is created as well
    let user = config.smokeUser;
    if (_.isEqual(_.pick(req.sessionModel.attributes, Object.keys(user)), user)) {
      return true;
    }
    let orderCode = req.sessionModel.get('orderCode');
    let paymentsArray = _.get(req, 'session.payment');
    let p = _.find(paymentsArray, o => {
      return o.reference === orderCode;
    });
    if (p && p.paymentId && p.status === 'success') {
      req.sessionModel.set('paymentId', p.paymentId);
      return p;
    }
    logger.error('No successful payment found in  ', paymentsArray);
    return false;
  }

  getOverriddenTypeaheadValues(req) {
    const removeOverriddenValues = options => options.filter(option => !option.overridden);
    const valuesExists = (options, value) => _.find(options, {value: value});
    const addOverriddenValue = (options, value) => {
      if (!valuesExists(options, value)) {
        options.push({
          label: `notranslate.${value}`,
          value: value,
          overridden: true
        });
      }
    };
    this.overridableTypeaheadKeys.forEach(key => {
      const value = req.sessionModel.attributes[key] ||
        req.sessionModel.attributes.errorValues && req.sessionModel.attributes.errorValues[key];
      req.fields[key].options = removeOverriddenValues(req.fields[key].options);
      addOverriddenValue(req.fields[key].options, value);
    });
  }

  isSmoke(props, user) {
    return _.isEqual(_.pick(props, Object.keys(user)), user);
  }

  getValues(req, res, callback) {
    this.getOverriddenTypeaheadValues(req);
    super.getValues(req, res, callback);
  }

  stripTags(values) {
    return Object.keys(values).reduce((previous, key) => {
      previous[key] = striptags(values[key]);
      return previous;
    }, {});
  }

  stripSpaces(values) {
    return Object.keys(values).reduce((previous, key) => {
      let val = values[key];
      previous[key] = val ? val.trim() : val;
      return previous;
    }, {});
  }

  clearFields(req) {
    /* Clears certain fields in the form values based on values of drive fields.
      Accepts a collection of clear specs:
      {
        <drive field name>:{
          <test value of drive field>:[<field to clear if value doesn't match>, <field ... ],
          ...
        },
        ...
      }
    */
    _.each(this.dependentFields || {}, (values, field) => {
      var val = req.form.values[field];
      _.each(values, (clearList, checkValue) => {
        if (val !== checkValue) {
          _.each(clearList || [], (clearField) => {
            req.form.values[clearField] = req.form.values[clearField] && '';
          });
        }
      });
    });
  }

  process(req, res, callback) {
    req.form.values = this.stripSpaces(this.stripTags(req.form.values));
    this.dateKeys.forEach(key => {
      req.form.values[key] = formatting.getDate(req.form.values, key);
      req.form.values[`${key}-formatted`] = formatting.getFormattedDate(req.form.values[key]);
    });
    this.timeKeys.forEach(key => {
      req.form.values[key] = formatting.getFormattedTime(formatting.getTime(req.form.values, key));
    });
    this.clearFields(req);
    super.process(req, res, callback);
  }

  validateField(key, req) {
    let value = req.form.values[key];
    let error = super.validateField(key, req);
    if (!error &&
        req.fields &&
        req.fields[key] &&
        req.fields[key].hasOwnProperty('validators')
    ) {
      req.fields[key].validators.forEach((validator) => {
        validator.formValues = Object.assign({}, req.sessionModel.attributes, req.form.values, {url: req.url});
        const dependentField = req.fields[key].dependent && req.fields[key].dependent.field;
        const dependentValue = req.fields[key].dependent && req.fields[key].dependent.value;

        if (!dependentField || dependentValue === req.form.values[dependentField]) {
          /* eslint-disable max-len */
          if (validator.type(value, typeof validator.arguments === 'function' ? validator.arguments() : validator.arguments)) {
            error = new this.ValidationError(key, {
              type: validator.type.name
            });
          }
          /* eslint-enable max-len */
        }
      });
    }
    if (error &&
      req.fields &&
      req.fields[key] &&
      req.fields[key].hasOwnProperty('ignoreValidate')
    ) {
      if (_.includes(req.fields[key].ignoreValidate, error.type)) {
        return false;
      }
    }
    // reset value if hof has emptied it
    req.form.values[key] = value;
    return error;
  }

  locals(req, res) {
    return Object.assign({
      errorlist: translation.errorlist(req.form.errors)
    }, super.locals(req, res));
  }

};
