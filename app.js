'use strict';

/* eslint no-underscore-dangle:1 */
global.__base = __dirname;

var express = require('express');
var app = express();
var path = require('path');
var logger = require('./lib/logger');
let httplog = require('./lib/http-log');
var config = require('./config');

app.use([config.assetPath, '/assets'], express.static(path.resolve(__dirname, './public')));

require('hof').template.setup(app, {
  path: config.govukAssetPath
});

// Mongo session
const mongoSession = require('./lib/session/mongo')(config);
app.use(mongoSession);

// parse cookies
app.use(require('cookie-parser')(config.session.secret));


// log http requests
app.use(httplog);

app.use(function setGaCode(req, res, next) {
  if (config.gaCode) {
    res.locals.gaCode = config.gaCode;
  }
  next();
});

app.use(function setAssetPath(req, res, next) {
  res.locals.assetPath = config.assetPath;
  next();
});

app.set('view engine', 'html');
app.set('views', path.resolve(__dirname, './apps/common/views'));
app.enable('view cache');
app.use(require('express-partial-templates')(app));
app.engine('html', require('hogan-express-strict'));

app.use(require('body-parser').urlencoded({extended: true}));
app.use(require('body-parser').json());

app.use(function setBaseUrl(req, res, next) {
  res.locals.baseUrl = req.baseUrl;
  next();
});

// Version checking endpoint
app.use(require('./middleware/version'));

// Trust proxy for secure cookies
app.set('trust proxy', 1);

function secureCookies(req, res, next) {
  var cookie = res.cookie.bind(res);
  res.cookie = function cookieHandler(name, value, options) {
    options = options || {};
    options.secure = (req.protocol === 'https');
    options.httpOnly = true;
    options.path = '/';
    cookie(name, value, options);
  };
  next();
}

function nocache(req, res, next) {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
}

app.use(secureCookies, nocache);

/* eslint-disable no-process-env */
if (process.env.ALLOW_BOOTSTRAP_SESSION === 'true') {
  app.use('/test/bootstrap-session', (req, res) => {
    req.session['hof-wizard-apply'] = req.body;
    res.send('Session populate complete');
  });
}
/* eslint-enable no-process-env */

app.get('/cookies', function renderCookies(req, res) {
  res.render('cookies');
});

app.get('/terms-and-conditions', function renderTerms(req, res) {
  res.render('terms-and-conditions');
});

app.get('/privacy-policy', function renderTerms(req, res) {
  res.render('privacy-policy');
});

// use the hof middleware
app.use(require('hof').middleware.cookies());

// apps
app.use(require('./apps/download/'));
app.use(require('./apps/download-photo/'));


// redirects
app.use(require('./redirects/start'));

// 404s
app.use(require('./middleware/not-found')());

// errors
app.use(require('./errors/'));

/* eslint camelcase: 0*/
const server = app.listen(config.port, config.listen_host);
/* eslint camelcase: 1*/
logger.info('App listening on port', config.port);


module.exports = server;
