'use strict';

/* eslint-disable max-len */
let extend = (res) => {
  res.locals['input-start'] = () => {
    return (key) => `
      <button class="button button-get-started" id="continue">
      	<span lang="en">{{#t}}en.buttons.${key}{{/t}}</span><span lang="ar">{{#t}}ar.buttons.${key}{{/t}}</span>
      </button>
    `;
  };
  res.locals['file-upload'] = () => {
    return (key) => {
      return `
        <div id="${key}-group" class="form-group{{#errors.${key}}}-error{{/errors.${key}}}">
          {{#errors.${key}}}
            <span class="error-message">{{{errors.${key}.message}}}</span>
          {{/errors.${key}}}
          <label for="${key}" class="button visuallyhidden">
            <span lang="en">{{#t}}en.fields.${key}.label{{/t}}</span><span lang="ar">{{#t}}ar.fields.${key}.label{{/t}}</span>
          </label>
          <input type="file" id="${key}" name="${key}">
        </div>
      `;
    };
  };
};

module.exports = {
  extend: extend
};
