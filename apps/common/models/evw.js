'use strict';

const db = require('../../../lib/db');
const logger = require('../../../lib/logger');
const reference = require('../../../lib/reference');
const validate = require('jsonschema').validate;

class Evw {

  constructor(config) {
    Object.assign(this, config || {});
  }

  generateOrderCode() {
    const orderCode = reference.generateOrderCode(this.product.orderCodePrefix);
    return Promise.resolve(orderCode);
  }

  setAsPaid(data) {
    if (!data) {
      throw new Error('model.setAsPaid must have data passed to it');
    }

    const setProperties = appRef => {
      const transformedData = Object.assign({}, data, {
        applicationReference: appRef,
        fee: this.product.cost,
        paid: true,
        paymentDate: new Date(),
      });
      if (data.paymentId) {
        transformedData.paymentId = data.paymentId;
      }
      return Promise.resolve(transformedData);
    };

    return reference.generateApplicationReference()
      .then(setProperties);
  }

  save(data) {
    if (!data) {
      throw new Error('model.save must have data passed to it');
    }

    let record;

    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();
      if (!data.objectId) {
        record = Object.assign({}, data, {
          createdAt: now
        });
        return db.insertApplication(record, this.collectionName, (err, result) => {
          if (err) {
            return reject(err);
          }
          record.objectId = result;
          return resolve(record);
        });
      }
      record = Object.assign({}, data, {
        updatedAt: now
      });
      return db.upsertApplicationByObjectId(record.objectId, record, this.collectionName, (err, result) => {
        const upsertResult = result ? result.result : 'failure';
        logger.info(`upserted ${record.objectId}`, upsertResult);
        if (err) {
          return reject(err);
        }
        return resolve(record);
      });
    });
  }

  saveAndResolve(data) {
    if (!data) {
      throw new Error('model.saveAndResolve must have data passed to it');
    }
    return this.save(data)
      .then(() => Promise.resolve(data))
      .catch(saveError => {
        logger.error('Failed to save to database', data.objectId, saveError);
        return Promise.resolve(data);
      });
  }

  send(data) {
    if (!data) {
      throw new Error('model.send must have data passed to it');
    }
    let transformed;

    return this.transform.transformData(data)
      .then(transformedData => {
        transformed = transformedData;
        return this.validate(transformed, this.schema);
      })
      .then(() => this.post(transformed, this.integrationService))
      .then(postResult => {
        logger.info(`Send successful ${data.applicationReference}`, postResult);
        // update record to show imported and validated
        let saveData = Object.assign({}, data, {
          imported: true,
          validation: {
            validated: true
          }
        });
        return this.saveAndResolve(saveData);
      })
      .catch(error => {
        // log issue, save to the database and always resolve anyway
        const errors = error.errors ? error.errors : error.message || error;
        logger.error(`Failed to send application, objectId ${data.objectId}, ref ${data.applicationReference}`, errors);
        let saveData = Object.assign({}, data, {
          validation: {
            validated: false,
            errors: errors
          }
        });
        return this.saveAndResolve(saveData);
      });
  }

  validate(data, schema) {
    if (!data || !schema) {
      throw new Error('model.validate requires data and a schema');
    }
    const result = validate(data, schema);

    if (result.errors.length > 0) {
      return Promise.reject(result);
    }
    return Promise.resolve(result);
  }

}

module.exports = Evw;
