'use strict';

const moment = require('moment');
const configFormat = require('../config').format;

function getTime(values, key) {
  const hour = `${values[key + '-hour']}`;
  const minute = `${values[key + '-minute']}`;
  return (hour !== '' && minute !== '') ? `${values[key + '-hour']}:${values[key + '-minute']}` : '';
}

function getFormattedTime(timeString, format) {
  const formattedTime = moment(timeString, configFormat.saveTime).format(format || configFormat.displayTime);
  return formattedTime;
}

function getDate(values, key) {
  const pad = function pad(n) {
    return (n.length < 2) ? '0' + n : n;
  };
  const day = `${values[key + '-day']}`;
  const month = `${values[key + '-month']}`;
  const year = `${values[key + '-year']}`;
  return (year !== '' && month !== '' && day !== '') ? `${year}-${pad(month)}-${pad(day)}` : '';
}

function getFormattedDate(dateString, format) {
  return moment(dateString, configFormat.saveDate).format(format || configFormat.displayDate);
}

// Convert times from ISO Strings to time and date
const splitTimes = (destination, isUtc) => {
  if (destination.hasOwnProperty('date')) {
    return destination;
  }

  let mtime = moment(destination.time);

  if (isUtc) {
    mtime = moment.utc(destination.time);
  }

  return Object.assign(destination, {
    time: mtime.format('HH:mm'),
    date: mtime.format('DD MMM YYYY')
  });
};

// e.g. dateHints('2-months-future') => 20 12 2017
const dateHint = (str) => {
  let date = str.split('-');
  let direction = date[2] === 'past' ? 'subtract' : 'add';
  return `<span dir="ltr">${moment()[direction](date[0], date[1]).format(configFormat.hintFormat)}</span>`;
};

module.exports = {
  getTime: getTime,
  getFormattedTime: getFormattedTime,
  getDate: getDate,
  getFormattedDate: getFormattedDate,
  splitTimes: splitTimes,
  dateHint: dateHint
};
