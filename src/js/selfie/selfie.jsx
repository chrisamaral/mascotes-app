/** @jsx React.DOM */

window.startSelfie = function (container, lang, onClose) {
  lang = lang || 'pt';

  var Selfie = require('./selfie.app.jsx');
  var messages = Selfie.messages;
  var Root = Selfie.component;
  var m = messages[lang];

  var closable;

  if (onClose) {
    closable = function () {
      onClose(function () {
        React.unmountComponentAtNode(container);
      });
    };
  }

  React.render(<Root onClose={closable} messages={m.messages} locales={m.locales} />, container);
};

