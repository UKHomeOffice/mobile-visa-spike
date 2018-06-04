'use strict';

var $ = require('jquery');

function onPassportImageUploadPage() {
  return !!$('#passport-image-group').length;
}

function showLabel() {
  $('#passport-image-group label').removeClass('visuallyhidden');
}

function hideFilePicker() {
  $('#passport-image-group input').hide();
}

function hideContinueButton() {
  $('#continue').hide();
}

function setupPassportImageUpload() {
  if (!onPassportImageUploadPage()) {
    return;
  }
  showLabel();
  hideFilePicker();
  hideContinueButton();
  $('#passport-image').on('change', function changeEventHandler(e) {
    if (e.target.name === 'passport-image') {
      $('#continue').click();
    }
  });
}

module.exports = {
  setupPassportImageUpload: setupPassportImageUpload
};
