var async = require('async');

module.exports = function () {
  var canvas = this.refs.captureCanvas.getDOMNode();
  var $wrap = $(this.refs.wrap.getDOMNode());

  var bSize = {
    top: 142 * $wrap.height() / 672,
    bottom: 127 * $wrap.height() / 672,
    left: 141 * $wrap.width() / 1094,
    right: 137 * $wrap.width() / 1094
  };

  var borderStroke = {
    height: 21 * ($wrap.height() / 672),
    width: 21 * ($wrap.width() / 1094)
  };

  var $canvas = $(canvas),
    width = $wrap.width() + bSize.left + bSize.right,
    height = $wrap.height() + bSize.top + bSize.bottom;

  $canvas.width(width).height(height)
    .attr('width', width).attr('height', height);

  function imgfy(src) {
    var i = new Image();
    i.src = src;
    return i;
  }

  var m = _.find(this.state.mascotes, {full: this.state.mascote});
  var imgSuffix = '';

  if (this.props.locales[0].substr(0, 2) !== 'pt') {
    imgSuffix = '-en';
  }

  var imgs = {
    border: imgfy('img/bg-final-clean.png'),
    olyLogo: imgfy('img/' + m.category + '-logo' + imgSuffix + '.png'),
    selfieLogo: imgfy('img/selfie-logo' + imgSuffix + '.png'),
    url: imgfy('img/site-url' + imgSuffix + '.png')
  };

  var ctx = canvas.getContext('2d');

  var generateDataURL = function () {

    ctx.rect(0, 0, width, height);
    ctx.fillStyle = '#fffbcc';
    ctx.fill();


    _.forEach(['selfie', 'mascote'], function (key) {
      var target = this.refs[key];

      ctx.drawImage(target.refs.img.getDOMNode(),
        bSize.left + target.state.left,
        target.state.top + bSize.top,
        target.state.width, target.state.height
      );
    }, this);


    var selfieLogoPos = {
      left: bSize.left * 0.5,
      top: bSize.top - (imgs.selfieLogo.naturalHeight * 0.8)
    };

    ctx.drawImage(imgs.border, 0, 0, width, height);
    ctx.drawImage(imgs.selfieLogo, selfieLogoPos.left, selfieLogoPos.top);
    ctx.drawImage(imgs.olyLogo, selfieLogoPos.left + imgs.selfieLogo.naturalWidth + 10,
      selfieLogoPos.top - ((imgs.olyLogo.naturalHeight - imgs.selfieLogo.naturalHeight) * 0.5));


    ctx.drawImage(imgs.url,
      width - bSize.right - imgs.url.naturalWidth,
      height - ((bSize.bottom - borderStroke.height) * 0.5) - (imgs.url.naturalHeight * 0.5)
    );

    /*
     ctx.rect(bSize.left, bSize.top, $wrap.width(), $wrap.height());
     ctx.strokeStyle = 'black';
     ctx.stroke();
     */

    this.setState({savedURL: canvas.toDataURL('image/jpeg', 0.85)});

    ctx.clearRect(0, 0, width, height);
  }.bind(this);

  async.each(_.values(imgs), function (img, callback) {
    if (img.complete) {
      callback();
    } else {
      img.onload = function () {
        callback();
      };
    }
  }, generateDataURL);
};