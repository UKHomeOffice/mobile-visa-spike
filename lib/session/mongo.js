'use strict';

const session = require('express-session');
let MongoStore;
if (process.env.NODE_ENV !== 'ci-no-mongo') {
  MongoStore = require('connect-mongo')(session);
}

module.exports = (config) => {
  return session({
    secret: config.session.secret,
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: (
        config.env === 'development' ||
        config.env === 'ci'
        ) ? false : true
    },
    store: process.env.NODE_ENV !== 'ci-no-mongo' ? new MongoStore({
      url: config.mongo.connectionString,
      ttl: config.session.ttl
    }) : false
  });
};
