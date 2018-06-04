'use strict';

var _ = require('lodash');
var $ = require('jquery');
var SUFFIX = '_typeahead';

function HofTypeahead() {}

HofTypeahead.prototype.createElementForTypeahead = function createElementForTypeahead() {
  var $el = $('#' + this.originalId);
  var maxLength = $el.data('typeahead-maxlength') || '';
  var classNames = $el.attr('class');
  return '<input type="text" name="' + this.id + '" id="' + this.id + '" class="form-control ' + classNames + '" ' +
    (maxLength ? 'maxlength="' + maxLength + '" ' : '') +
    'aria-describedby="' + this.originalId + '-hint">' +
    '<input type="hidden" name="' + this.originalId + '" id="' + this.originalId + '">';
};

HofTypeahead.prototype.readValues = function readValues(source) {
  var suggestions = [];
  if (typeof source === 'object'
    && $(source).find('option').length) {
    suggestions = $.map($(source).find('option'),
      function map(el) {
        if (el.value === '' || el.value === 'none') {
          return undefined;
        }
        var obj = {};
        obj[el.text] = {};
        obj[el.text].value = el.value;
        return obj;
      });
  }
  return suggestions;
};

HofTypeahead.prototype.substringMatcher = function substringMatcher(strs) {
  /* eslint-disable consistent-return */
  return function findMatches(q, cb) {
    var matches = [];
    var cachedValues = [];
    var substrRegex = new RegExp('(^' + q + ')|(\\s' + q + ')|(\\(' + q + ')', 'i');
    $.each(strs, function matcher(i, str) {
      var suggest = Object.keys(str)[0];
      if (substrRegex.test(suggest)) {
        matches.push(suggest);
        cachedValues.push(str);
        return true;
      }
    });
    $('#' + this.id).data('suggestions', cachedValues);
    cb(matches);
  }.bind(this);
  /* eslint-enable consistent-return */
};

HofTypeahead.prototype.initTypeahead = function initTypeahead(values) {
  var element = $('#' + this.id);
  element.typeahead({
    hint: false,
    highlight: true,
    minLength: 1
  },
    {
      name: this.id,
      source: this.substringMatcher(values),
      limit: 5
    });
  this.form.on('submit', this.onSubmit.bind(this));
  this.bindCustomEvents(element);
  this.onUnload(element);
};

HofTypeahead.prototype.onUnload = function onUnload(el) {
  /* eslint-disable no-undef */
  $(window).unload(function onWindowUnload() {
    /* eslint-enable no-undef */
    el.typeahead('destroy');
    this.form.off('submit');
  }.bind(this));
};

HofTypeahead.prototype.bindCustomEvents = function bindCustomEvents(el) {
  el.bind('typeahead:render', function bind() {
    el.closest('.twitter-typeahead').find('.tt-suggestion:first-child').addClass('tt-cursor');
  });
};

HofTypeahead.prototype.replaceElement = function replaceElement(selectorToBeReplaced, elementToAppend) {
  return $(selectorToBeReplaced).replaceWith(elementToAppend);
};

HofTypeahead.prototype.readExistingValue = function readExistingValue(selector, values) {
  var selection = $(selector).find(':selected').val();
  if (!selection) {
    return null;
  }
  var obj = _.find(values, function find(val) {
    var key = Object.keys(val)[0];
    return val[key].value === selection;
  });
  if (obj) {
    var key = Object.keys(obj)[0];
    var value = obj[key].value;
    return {
      value: value,
      key: key
    };
  }
  return null;
};

HofTypeahead.prototype.onSubmit = function onSubmit() {
  var typeahead = $('#' + this.id);
  var matches = typeahead.data('suggestions');
  var suggestion = typeahead.val();
  var selectedObject = _.find(matches, function findSelected(val) {
    return Object.keys(val)[0] === suggestion;
  });
  // there's no match -- the user has entered something that wasn't really foreseeable
  if (!selectedObject || !selectedObject[Object.keys(selectedObject)[0]].value) {
    $('#' + this.originalId).val(suggestion);
  } else {
    // there's a match. Use the value that the select would have had
    var value = selectedObject[Object.keys(selectedObject)[0]].value;
    $('#' + this.originalId).val(value);
  }
};

HofTypeahead.prototype.setExistingValue = function setExistingValue(existingValue) {
  var typeaheadSelector = '#' + this.id;
  $(typeaheadSelector).typeahead('val', existingValue.key);
};

HofTypeahead.prototype.setupTypeahead = function setupTypeahead(el) {
  var values = this.readValues(el);
  var id = $(el).attr('id');
  // the id of the replaced field
  this.originalId = id;
  // the id of the typeahead (id_typeahead)
  this.id = this.originalId + SUFFIX;
  var inputField = this.createElementForTypeahead();
  this.form = $(el).closest('form');
  this.existingValue = this.readExistingValue(el, values);
  this.replaceElement(el, inputField);
  this.initTypeahead(values);
  if (this.existingValue) {
    this.setExistingValue(this.existingValue);
  }
};

module.exports = HofTypeahead;
