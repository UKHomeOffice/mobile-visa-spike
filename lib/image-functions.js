'use strict';

const conf = require('../config');
const check = require('./virus-check');
const fs = require('fs');
const mongoConnector = require('./db/connection');
const mongod = require('mongodb');
const Grid = require('gridfs-stream');
const logger = require('./logger');
const im = require('imagemagick-stream');
const uuid = require('node-uuid');

mongoConnector.setConnectionString(conf.mongo.connectionString);
let gridfs = false;
let dbSingleton = false;

/**
 * Reliably calls the callback function with a connected and 'alive' gridfs connection.
 * NOTE: this method should be called before any interaction with gridfs!
 *
 * @param callback
 */
function createGFSConnection(callback) {
  mongoConnector.getConnection((err, db) => {
    if (err) {
      logger.error('Problem trying to get connection to mongo');
      logger.error(err);
    } else if (!dbSingleton || dbSingleton !== db) {
      dbSingleton = db;
      gridfs = new Grid(db, mongod);
    }
    callback(err, gridfs);
  });
}

function save(fileToSave, callback) {
  createGFSConnection((err, gfs) => {
    if (!err) {
      let writestream = gfs.createWriteStream({filename: uuid.v4()});
      fs.createReadStream(fileToSave).pipe(writestream);
      writestream.on('error', callback);
      writestream.on('close', file => {
        callback(err, file);
      });
    } else {
      logger.error('Problem saving file to gridfs', err);
      callback(err);
    }
  });
}

function remove(filename, callback) {
  createGFSConnection((err, gfs) => {
    if (!err) {
      gfs.remove({filename: filename}, removeErr => {
        if (removeErr) {
          return callback(removeErr);
        }
        return callback();
      });
    } else {
      logger.error('Problem saving file to gridfs', err);
      callback(err);
    }
  });
}

function getFileStream(fileID, callback) {
  createGFSConnection((err, gfs) => {
    if (!err) {
      let readstream = gfs.createReadStream({filename: fileID});

      readstream.on('open', readErr => {
        callback(readErr, readstream);
      });

      readstream.on('error', readErr => {
        callback(readErr, undefined);
      });
    } else {
      logger.error('Problem getting file stream', err);
      callback(err);
    }
  });
}

function getPassportImage(image, width, callback) {
  this.getFileStream(image, (err, img) => {
    if (err) {
      logger.error('Problem getting passport image', err);
      return callback(err);
    }
    if (img !== undefined) {
      const height = width;
      img = img.pipe(im().resize(width + 'x' + height));
    }
    callback(err, img);
  });
}

function saveFile(file, callback) {
  check(file, err => {
    if (!err) {
      this.save(file, callback);
    } else {
      logger.error('Problem saving passport image', err);
      callback(err);
    }
  });
}

module.exports = {
  save: save,
  saveFile: saveFile,
  getFileStream: getFileStream,
  getPassportImage: getPassportImage,
  remove: remove
};
