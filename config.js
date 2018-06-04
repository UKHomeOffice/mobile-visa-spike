'use strict';

/* eslint no-process-env: 0*/
/* eslint no-inline-comments: 0*/
/* eslint camelcase: 0*/

let port = process.env.PORT || 8080;

module.exports = {
  appName: 'digital-display',
  env: process.env.NODE_ENV,
  port: port,
  baseUrl: process.env.BASE_URL || 'http://localhost',
  hostUrl: process.env.HOST_URL || 'http://localhost:8080',
  listen_host: process.env.LISTEN_HOST || '0.0.0.0',
  gaCode: process.env.GOOGLE_ANALYTICS_CODE || 'something',
  assetPath: process.env.ASSET_PATH || '/public',
  govukAssetPath: process.env.GOVUK_ASSET_PATH || '/govuk-assets',
  appPath: 'start',
  paymentService: process.env.PAYMENT_SERVICE,
  session: {
    secret: process.env.SESSION_SECRET || 'something',
    ttl: process.env.SESSION_TTL || 3600 /* 60 mins */
  },
  mongo: {
    connectionString: process.env.MONGO_CONNECTION_STRING || 'mongodb://localhost:27017/evwCustomer',
    collectionName: 'evws'
  },
  imageUploadDir: process.env.IMAGE_UPLOAD_DIR || 'public/images/upload.tmp',
  maxUploadSize: process.env.MAX_UPLOAD_SIZE || 10485760,
  validImageTypes: ['image/jpeg', 'image/png'],
  imageRetrieveSizesAllowed: [500, 150],
  format: {
    displayDate: 'DD/MM/YYYY',
    displayTime: 'HH:mm',
    saveDate: 'YYYY-MM-DD',
    saveTime: 'HH:mm',
    hintFormat: 'DD MM YYYY'
  }
};
