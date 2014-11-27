if (!window.intl) {
  window.Intl = require('intl');
}

window.$ = require('./../ext/jquery.min.js');
window.jQuery = window.$;
window.React = require('react/addons');
window.ReactIntlMixin = require('react-intl');
window._ = require('./../ext/lodash.min.js');

require('./../ext/l.min.js');

$(function () {
  var fromCordova;
  var deps = ['js/selfie.js'];

  fromCordova = document.URL.indexOf('http://') === -1;
  fromCordova = fromCordova && document.URL.indexOf('https://') === -1;

  if (fromCordova) deps = ['cordova.js'].concat(deps);

  ljs.load(deps, function () {
    startSelfie(document.getElementById('SELFIE'), 'pt');

    $('#LangSwitch>select').on('change', function () {
      startSelfie(document.getElementById('SELFIE'), $(this).val());
    });

  });


}());