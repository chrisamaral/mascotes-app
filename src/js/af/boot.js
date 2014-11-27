if (!window.Intl) {
  window.Intl = require('intl');
}

window.$ = require('jquery');
window.React = require('react/addons');
window.ReactIntlMixin = require('react-intl');
window._ = require('lodash');

$(function () {

  require('./../ext/l.min.js');

  ljs.load(['js/af.js', 'css/af.css'], function () {
    var changeLang = AtletadoFuturo(document.getElementById('AF'), 'pt');
    $('#LangSwitch>select').on('change', function () {
      changeLang($(this).val());
    });
  });

});