'use strict';

module.exports = {
  '/enter-your-details': {
    checkSession: false,
    fields: [
      'passport-number',
      'date-of-birth',
      'date-of-birth-day',
      'date-of-birth-month',
      'date-of-birth-year'
    ],
    template: 'enter-your-details',
    next: '/download',
  },
  '/download': {
    template: 'download-your-evw',
    clearSession: false
  }
};
