window.$ = require('./../ext/jquery.min.js');
window.jQuery = window.$;

$(function () {
  if (!Modernizr.touch) return;
  require('./../ext/fastclick.js')(document.body);
});

window.app_base = '';

window.fromCordova =
  document.URL.substr(0, 'http://'.length) !== 'http://' &&
  document.URL.substr(0, 'https://'.length) !== 'https://';

require('./../ext/l.min.js');

$(function () {

  if (!fromCordova) {
    return require('./view.jsx')('pt');
  }

  $('html').addClass('cordova');

  function onDeviceReady() {
    var AppRenderer = require('./view.jsx');

    navigator.globalization.getPreferredLanguage(
      function (language) {
        var lang = language.value.substr(0, 2);

        if (lang !== 'en') {
          lang = 'pt';
        }

        AppRenderer(lang);
      },
      function () {
        AppRenderer('pt');
      }
    );
  }

  function bindEvents () {
    document.addEventListener("deviceready", onDeviceReady, false);
  }

  ljs.load(['cordova.js'], bindEvents);
});