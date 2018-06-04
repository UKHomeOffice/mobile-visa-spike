'use strict';

const fs = require('fs');
const logger = require('./logger');
const imageFunctions = require('./image-functions');
const deferred = require('deferred');
const config = require('../config');

function saveToGridFs(req, def) {
  imageFunctions.saveFile(req.file.path, (err, file) => {
    if (err) {
      logger.error(`Problem saving file ${file} to GridFS: ${err}`, logger.getMeta(req)
      );
      def.reject('Problem saving file to database', err);
    } else {
      def.resolve(file);
    }
  });
  return def.promise;
}

function deleteFile(file) {
  if (file) {
    try {
      logger.log(`About to delete file ${file.filename} at ${file.path}`);
      fs.unlinkSync(file.path);
    } catch (e) {
      logger.error('Failed to delete a bad file because clamAV has probably deleted it already:', e.message);
    }
  }
}

function saveFile(req, onSuccess, onError) {
  let result = saveToGridFs(req, deferred());
  result.done(file => {
    deleteFile(file);
    onSuccess(null, {
      /* eslint-disable no-underscore-dangle*/
      imageUploadObjectId: file._id,
      /* eslint-enable no-underscore-dangle*/
      imageUploadFilename: file.filename,
      imageMimetype: req.file.mimetype
    });
  }, err => {
    deleteFile(req.file);
    onError(err);
  });
}

function handleUpload(req, callback) {
  if (req.file.size > config.maxUploadSize) {
    deleteFile(req.file);
    return callback('file-too-large');
  }
  // Two attempts to save the file before displaying an error message
  this.saveFile(req, callback, () => {
    logger.log('Retrying to save passport image to Grid FS / Mongo', logger.getMeta(req));
    this.saveFile(req, callback, saveFileErr => {
      logger.error(`Problem saving passport image file to Grid FS / Mongo. Error: ${saveFileErr}`,
        logger.getMeta(req)
      );
      return callback('error-saving-file');
    });
  });
}

module.exports = {
  uploadFile: handleUpload,
  saveFile: saveFile,
  deleteFile: deleteFile,
  saveToGridFs: saveToGridFs
};
