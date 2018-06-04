'use strict';

const path = require('path');
const hof = require('hof');
const wizard = require('hof-form-wizard');
const mixins = hof.mixins;
const controllers = hof.controllers;
const router = require('express').Router();
const BaseController = controllers.base;
const Translation = require('../../lib/translation');

let translation = new Translation(__dirname);
let steps = require('./steps');

let fields = Object.assign({},
  require('../common/fields/'),
  require('./fields/')
);

let formWizard = wizard(steps, fields, {
  controller: BaseController,
  templatePath: path.resolve(__dirname, 'views'),
  translate: translation.multiTranslate.bind(translation),
  params: '/:action?'
});

// Set application css
router.use((req, res, next) => {
  req.app.locals.appCss = 'app';
  next();
});

router.use(mixins(fields, {
  translate: translation.multiTranslate.bind(translation),
  viewsDirectory: `${__dirname}/../common/views/`
}));

router.use('/download/', (req, res, next) => {
  formWizard(req, res, next);
});

// ----- testing ----

var generatePDF = (html, res) => {
  const wkhtmltopdf = require('wkhtmltopdf');
  return wkhtmltopdf(html, (err) => {
    if (err) {
      console.error('error generating pdf', err);
    }
  }).pipe(res);
};

// Convert times from ISO Strings to time and date
var splitTimes = (destination, isUtc) => {
  const moment = require('moment');
  var mtime = moment(destination.time);

  if (isUtc) {
    mtime = moment.utc(destination.time);
  }

  return Object.assign({}, destination, {
    time: mtime.format('HH:mm'),
    date: mtime.format('DD MMM YYYY')
  });
};


let test = (req, res) => {

  let template = require(`${__base}/node_modules/evw-integration-stub/mocks/templates/evw/valid`);
  let render = req.query.ffNewPdf ? 'pdf-simple' : 'pdf';
  template.internalCustomerUrl = 'http://localhost:8080';
  template.departure.time = new Date('1 March 2017 08:37 UTC+3');
  template.arrival.time = new Date('1 March 2017 12:55 GMT');
  template.departure = splitTimes(template.departure, true);
  template.arrival = splitTimes(template.arrival);

  res.render(`${__dirname}/views/${render}`, template, (err, html) => {
    if (err) {
      throw new Error(err);
    }
    if (req.query.download) {
      res.setHeader('Content-Type', 'application/pdf');
      generatePDF(html, res);
    } else {
      res.send(html);
    }
  });
};

// Only available for testing in development
if (process.env.NODE_ENV === 'development') {
  router.use('/pdf-test/', test);
}

module.exports = router;
