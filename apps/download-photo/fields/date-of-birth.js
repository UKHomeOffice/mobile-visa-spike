'use strict';

const moment = require('moment');
const beforeDate = require('../../../lib/validators').beforeDate;

module.exports = {
  'date-of-birth': {
    key: 'date-of-birth',
    validate: [],
    validators: [{
      type: beforeDate,
      arguments: () => moment().subtract(100, 'years').format('YYYY-MM-DD')
    }]
  },
  'date-of-birth-day': {
    label: 'fields.date-of-birth-day.label'
  },
  'date-of-birth-month': {
    label: 'fields.date-of-birth-month.label'
  },
  'date-of-birth-year': {
    label: 'fields.date-of-birth-year.label'
  }
};
