'use strict';

var $ = require('jquery');

module.exports = function watchDownload() {
  $('form[action="/download/pdf"]').on('submit', function temporarilyDisableDownloadButton() {
    var $button = $('.download');
    $button.prop('disabled', true);
    setTimeout(function reenableDownloadButton() {
      $button.prop('disabled', false);
    }, 30 * 1000);
  });
};
