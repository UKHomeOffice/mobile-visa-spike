'use strict';

const moment = require('moment');

function validateDepartureDate(arrivalDateTime, departureDateTime, allowTimeTravel, departureMode) {
  if (!departureMode) {
    departureMode = null;
  }
  if (!arrivalDateTime.isValid() || !departureDateTime.isValid()) {
    return false;
  }
  const departureWithin48Hours = () => {
    const twoDaysInFuture = moment().add(2, 'days');
    return departureDateTime.isValid() && departureDateTime.isBefore(twoDaysInFuture);
  };
  const departureNotWithin24HoursOfArrival = () => {
    return departureDateTime.diff(arrivalDateTime, 'hours', true) < -24;
  };
  const departureAfterArrival = () => {
    if (allowTimeTravel) {
      arrivalDateTime = arrivalDateTime.add(1, 'hour');
    }
    return arrivalDateTime.isValid() && departureDateTime.isValid() && departureDateTime.isAfter(arrivalDateTime);
  };

  if (departureWithin48Hours()) {
    return 'travel-too-soon';
  }
  // boats can take longer than 24hrs to travel
  if (departureNotWithin24HoursOfArrival() && departureMode !== 'boat') {
    return 'depart-24-hours-before-arrive';
  }
  if (departureAfterArrival()) {
    return 'depart-after-arrive';
  }
  return false;
}

module.exports = {

  beforeDate: function beforeDate(value, limit) {
    return moment(value)
      .isBefore(moment(limit));
  },

  afterDate: function afterDate(value, limit) {
    return moment(value)
      .isAfter(moment(limit));
  },

  beforeFieldValue: function beforeFieldValue(value, fieldName) {
    this.formValues = this.formValues || beforeFieldValue.formValues;
    return moment(value)
      .isBefore(moment(this.formValues[fieldName]));
  },

  afterFieldValue: function afterFieldValue(value, fieldName) {
    this.formValues = this.formValues || afterFieldValue.formValues;
    return moment(value)
      .isAfter(moment(this.formValues[fieldName]));
  },

  validTime: function validTime(value) {
    return value === 'Invalid date';
  },

  flightNumberRegex: function flightNumberRegex(value) {
    this.formValues = this.formValues || flightNumberRegex.formValues;
    let regex;
    if (this.formValues.url === '/what-is-your-flight-number') {
      regex = /^[a-zA-Z0-9 -]{2,3}[0-9 -]{1,4}[a-zA-Z]?$/;
    } else {
      regex = /^[0-9A-Za-z -]*$/;
    }
    return !value.match(regex);
  },

  validateDepartureDate: validateDepartureDate,

  matchField: function matchField(value, checkField) {
    return value !== this.formValues[checkField];
  }

};
