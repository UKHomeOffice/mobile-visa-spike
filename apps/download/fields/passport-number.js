'use strict';

module.exports = {
  'passport-number': {
    validate: [
      'required', {
        type: 'minlength',
        arguments: 7
      }, {
        type: 'maxlength',
        arguments: 15
      }, {
        type: 'regex',
        arguments: '^[a-zA-Z0-9]+$'
      }
    ],
    className: ['form-group']
  }
};
