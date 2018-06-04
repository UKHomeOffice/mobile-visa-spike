'use strict';

const EvwBaseController = require('../../common/controllers/evw-base');
const wkhtmltopdf = require('wkhtmltopdf');
const formatting = require(`${__base}/lib/formatting`);
const config = require(`${__base}/config`);
const logger = require('../../../lib/logger');
const fs = require('fs');
const uuid = require('uuid');
const uploadLocation = `${__base}/${config.imageUploadDir}`;

module.exports = class PdfController extends EvwBaseController {

  createTemporaryFileName(ref) {
    return (`${ref}-${uuid.v1()}.pdf`);
  }

  sendDownload(evw, filename, res) {
    const file = `${uploadLocation}/${filename}`;

    res.download(file, `Electronic visa waiver — ${evw.reference}.pdf`, err => {
      if (err) {
        logger.error(`could not send pdf for ${evw.reference}`, err);
      }
      fs.unlink(file, unlinkErr => {
        if (err) {
          logger.error(`failed to delete ${file}`, unlinkErr);
        } else {
          logger.info(`successfully deleted ${file}`);
        }
      });
    });
  }

  generatePDF(evw, res, callback) {

    let tempName = this.createTemporaryFileName(evw.reference);
    let tempFile = fs.createWriteStream(`${uploadLocation}/${tempName}`);

    wkhtmltopdf(evw.html, (err) => {
      if (err) {
        logger.error('error generating pdf', err);
        callback(err);
      }
    }).pipe(tempFile);

    tempFile.on('close', () => this.sendDownload(evw, tempName, res));
  }

  successHandler(req, res, callback) {
    let evw = req.sessionModel.get('evw-details');
    let template = 'pdf';
    evw.arrival = formatting.splitTimes(evw.arrival);
    evw.departure = evw.departure.port ? formatting.splitTimes(evw.departure, true) : '';
    evw.hostUrl = config.hostUrl;
    evw.dob = formatting.getFormattedDate(req.sessionModel.get('date-of-birth'));

    logger.info('Generating PDF for:', evw.evwNumber, logger.getMeta(req));
    return res.render(`${__base}/apps/download/views/${template}`, evw, (err, html) => {
      if (err) {
        callback(new Error(err));
      }
      this.emit('complete', req, res);
      this.generatePDF({
        html: html,
        reference: evw.evwNumber
      }, res, callback);
    });
  }

  locals(req, res) {
    const nt = req.sessionModel.get('numberAndToken');
    return Object.assign({
      EXTRA_NAV_URL: `/evw/${nt.number}/${nt.token}`
    }, super.locals(req, res));
  }

};
