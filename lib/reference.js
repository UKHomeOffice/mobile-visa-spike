'use strict';

const referenceId = require('rtp-reference-id');
const db = require('./db');
const logger = require('./logger');
const _ = require('lodash');
const fuhk = require('fuhk');

const REF_LENGTH = 8;
const REF_CHARS = ['2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function createApplicationReference() {
  return Array(REF_LENGTH).fill().map(() => _.sample(REF_CHARS)).join('');
}

function checkProfanity(applicationReference) {
  return fuhk(applicationReference).length === 0 ? Promise.resolve() : Promise.reject();
}

function checkUniqueness(applicationReference) {
  return new Promise((resolve, reject) => {
    db.findReferenceId(applicationReference, (err, result) => {
      // on the rare occasion that mongo errors, assume the reference is not used
      // at this stage in the journey we must give the user a reference
      // it's better to take a (very small) risk on the uniqueness, than to error completely
      if (err) {
        logger.error(`Mongo error trying to find application reference ${applicationReference}`, err);
        return resolve();
      }
      return result ? reject() : resolve();
    });
  });
}

function insertApplicationReference(applicationReference) {
  return new Promise((resolve) => {
    db.insertReferenceId(applicationReference, err => {
      // on the rare occasion that mongo errors, assume the reference is not used
      // at this stage in the journey we must give the user a reference
      // it's better to take a (very small) risk on the uniqueness, than to error completely
      if (err) {
        logger.error(`Mongo error trying to insert application reference ${applicationReference}`, err);
      }
      resolve(applicationReference);
    });
  });
}

function generateApplicationReference() {
  const applicationReference = this.createApplicationReference();
  return checkProfanity(applicationReference)
    .then(checkUniqueness.bind(this, applicationReference))
    .then(insertApplicationReference.bind(this, applicationReference))
    .catch(this.generateApplicationReference.bind(this));
}

function generateOrderCode(prefix) {
  return referenceId.generateOrderCode(prefix);
}

module.exports = {
  generateOrderCode: generateOrderCode,
  generateApplicationReference: generateApplicationReference,
  createApplicationReference: createApplicationReference
};
