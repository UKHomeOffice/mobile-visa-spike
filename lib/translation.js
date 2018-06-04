'use strict';

const hof = require('hof');
const i18nFuture = hof.i18n;
const path = require('path');
const langs = ['en', 'ar'];

module.exports = class Translation {
  constructor(dirname) {
    this.i18n = i18nFuture({
      path: path.resolve(dirname, './translations/__lng__/__ns__.json')
    });
  }

  translateKey(key, lang) {
    return this.i18n.translate.call(this.i18n, key, {
      lang: lang
    });
  }

  multiTranslate(key) {
    let keyParts = key.split('.');
    if (keyParts[0] === 'notranslate') {
      // we do not want to translate this key
      // probably because it was dynamically
      // generated, so we won't have a translation
      return key.split('.').splice(1).join('.');
    }

    if (langs.indexOf(keyParts[0]) > -1) {
      // Key has a locale so get a single translation
      // eg: en.pages.your-name.warning
      return this.translateKey(key.replace(`${keyParts[0]}.`, ''), keyParts[0]);
    }
    // Key doesn't have a locale so get a dual translation
    // eg: pages.your-name.warning
    let translations = [];
    langs.forEach((lang) => {
      let translatedKey = this.translateKey(key, lang);
      if (translatedKey !== key) {
        translations.push(`<span lang="${lang}">${translatedKey}</span>`);
      }
    });
    return translations.join('');
  }

  errorlist(errors) {
    let errlist = [];
    Object.keys(errors).forEach((key) => {
      let formattedErrors = {};
      errors[key].message.split('</span>').forEach((message) => {
        langs.forEach((lang) => {
          if (message.includes(`lang="${lang}"`)) {
            formattedErrors[lang] = message.substr(16);
          }
        });
      });

      errlist.push({
        key: key,
        type: errors[key].type,
        message: formattedErrors
      });
    });
    return errlist;
  }
};
