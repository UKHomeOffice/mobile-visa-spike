'use strict';

var $ = require('jquery');

var HofTypeahead = require('./typeahead');
var doNotExecuteOnIE8 = true;

function initTypeahead(event, typeaheadLibrary) {
  if (doNotExecuteOnIE8 && $('.lte-ie8').length) {
    return;
  }
  if (!typeaheadLibrary) {
    require('../../../node_modules/typeahead-aria/dist/typeahead.jquery');
  }
  $.each($('select.typeahead'), function setTypeahead(index, el) {
    new HofTypeahead().setupTypeahead(el);
  });
}

module.exports = initTypeahead;
