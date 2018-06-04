'use strict';

const router = require('express').Router();
const imageFunctions = require('../lib/image-functions');
const config = require('../config');

let getImage = function getImage(req, res, next) {
  const image = req.params.image;
  const width = parseInt(req.params.width, 10);
  if (image !== req.session.imageUploadFilename) {
    return next(new Error('Attempting to view passport image different to the uploaded one'));
  }
  if (config.imageRetrieveSizesAllowed.indexOf(width) === -1) {
    return next(new Error(`Attempting to view passport image in size that is not allowed: ${width}`));
  }
  imageFunctions.getPassportImage(image, width, (err, img) => {
    if (err) {
      next(new Error(`Problem with getPassportImage: ${err}`));
    } else {
      res.setHeader('Content-Type', req.session.imageMimetype || 'image/jpeg');
      img.pipe(res);
    }
  });
};

router.get('/:width/:image', getImage);

module.exports = {
  getImage: getImage,
  router: router
};
