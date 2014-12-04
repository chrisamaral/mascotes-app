/** @jsx React.DOM */

window.IScroll = require('../ext/iscroll.js');
function detectmob() {
  if( navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
  ){
    return true;
  } else {
    return false;
  }
}

window.sys_args = window.sys_args || {};

(function initializeBasePath() {

  if (typeof app_base !== 'undefined') return;

  window.app_base = '';

  if (sys_args && sys_args.base_url) {
    window.app_base = sys_args.base_url;
  }

  if (app_base && app_base.substr(app_base.length - 1) !== '/') {
    app_base = app_base + '/';
  }

}());

window.isMobile = detectmob();

var Menus = require('./selfie.menu.jsx');
var CanvasImg = require('./selfie.img.jsx');
var SideMenu = require('./selfie.side.menu.jsx');
var PopUpMenu = require('./selfie.pop.up.menu.jsx');
var localForage = require('localforage');
var async = require('async');

React.initializeTouchEvents(Modernizr.touch);

function isLandScape () {
  return window.innerWidth > window.innerHeight;
}

var hasObjectFit = ('objectFit' in document.documentElement.style);

var Video = React.createClass({
  mixins: [ReactIntlMixin],
  
  getInitialState: function () {
    return {};
  },

  resize: function () {
    if (!this.isMounted()) {
      return;
    }

    var video = this.getDOMNode();
    var $video = $(video);
    var $parent = $video.parent();
    
    var container = {
      width: $parent.width(),
      height: $parent.height()
    };

    var newState = {width: container.width, height: container.height}, ratio;
    
    if (!hasObjectFit && video.videoWidth && video.videoHeight) {

      if (video.videoWidth > video.videoHeight) {
        ratio = container.width / video.videoWidth;
      } else {
        ratio = container.height / video.videoHeight;
      }

      newState['WebkitTransform'] = 'scale(' + ratio + ')';
      newState['MozTransform'] = newState['WebkitTransform'];

      delete newState.width;
      delete newState.height;

      newState.position = 'absolute';
      newState.left = Math.min(0, (container.width - (video.videoWidth * ratio)) * 0.5);
      newState.top = Math.min(0, (container.height - (video.videoHeight * ratio)) * 0.5);
    }

    if (!_.isEqual(newState, this.state)) this.setState(newState);
  },

  componentDidMount: function () {
    this.resize();
    var self = this;
    this.getDOMNode().onplaying = function () {
      //bug, firefox não carregou as dimensões do vídeo mesmo quando deveria
      //self.resize();

      setTimeout(self.resize, 300);
    };
  },

  componentDidUpdate: function () {
    //this.resize();
  },
  
  componentWillReceiveProps: function () {
    this.resize();
  },

  render: function () {
    if (!hasObjectFit) {
      return <video autoPlay src={this.props.src} style={this.state} />;
    }

    return <video autoPlay src={this.props.src} width={this.state.width} height={this.state.height} />;
    
  }
});

var Canvas = React.createClass({
  mixins: [ReactIntlMixin],
  getInitialState: function () {
    return {width: null, height: null};
  },
  resize: function () {
    var $parent = $(this.getDOMNode()).parent();
    
    var state = {
      width: $parent.width(),
      height: $parent.height()
    };

    if (state.width !== this.state.width || state.height !== this.state.height) {
      this.setState(state);
    }
  },
  componentDidMount: function () {
    this.resize();
  },
  componentDidUpdate: function () {
    //this.resize();
  },

  render: function () {
    return <canvas className={this.props.ref} width={this.state.width} height={this.state.height} />;
  }
});


var ErrorMsg = React.createClass({
  mixins: [ReactIntlMixin],
  dismiss: function () {
    this.props.dismissError(this.props.index);
  },
  render: function () {
    return (
        <li data-alert className="alert-box alert radius">
          {this.props.msg}<a className="close" onClick={this.dismiss}>{'×'}</a>
        </li>
      );
  }
});

var ErrList = React.createClass({
  mixins: [ReactIntlMixin],
  render: function () {
    return (
      <ul id='SelfieAppErrors'>
        {
          _.map(this.props.errors, function (err, index) {
            return <ErrorMsg dismissError={this.props.dismissError} key={index} msg={err} index={index} />;
          }.bind(this))
        }
      </ul>
    );
  }
});

var Selfie = React.createClass({
  mixins: [ReactIntlMixin],
  getInitialState: function () {
    var selfie, mascote, mode = 'zero';

    if (Modernizr.localstorage) {
      if (localStorage.getItem('selfie.f1rst')) mode = 'initial';

    }

    if (selfie) mode = 'check';
    var defaults = {
      mode: mode,
      selfie: selfie,
      mascote: mascote,
      captureVideo: false,
      captureCanvas: false,
      selected: null,
      savedURL: null,
      isPopupMenuVisible: false,
      errors: [],
      mascotes: require('./selfie.mascots.js'),
      orientation: isLandScape() ? 'landscape' : 'portrait'
    };

    if (defaults.mascotes && !defaults.mascote) defaults.mascote = defaults.mascotes[0].full;

    return defaults;
  },

  resizeHandler: function () {
    this.state.orientation = isLandScape() ? 'landscape' : 'portrait';
    this.setState(this.state);
  },

  componentWillUnmount: function () {
    $(window).off('resize orientationchange', this.resizeHandler);
  },

  componentDidMount: function () {
    $(window).on('resize orientationchange', this.resizeHandler);

    this.resizeWrap();

    localForage.getItem('selfie.src').then(function (value) {
      if (!value) return;
      this.state.selfie = value;
      if (this.state.mode === 'initial') this.state.mode = 'check';
      this.setState(this.state);
    }.bind(this));

    localForage.getItem('mascote.src').then(function (value) {
      if (!value) return;
      this.state.mascote = value;
      this.setState(this.state);
    }.bind(this));

  },

  makeAlert: function (msg) {
    this.state.errors.push(msg);
    this.setState(this.state);
  },

  dismissError: function (index) {
    this.state.errors.splice(index, 1);
    this.setState(this.state);
  },

  setImage: function (name, src) {

    if (name === 'selfie' && this.state.mediaStreamObject) {
      this.state.mediaStreamObject.stop();
      delete this.state.mediaStreamObject;
    }

    this.state[name] = src;

    if (name === 'selfie') {
      this.state.mode = 'check';

      if (!this.state.mascote) {
        this.state.mascote = this.state.mascotes[0].full;
      }

    }

    if (this.state.isPopupMenuVisible) {
      this.state.isPopupMenuVisible = false;
    }

    this.setState(this.state, this.saveToLocalStorage);
  },

  saveToLocalStorage: function () {
    if (!Modernizr.localstorage || window.cordova) return;

    if (this.state.mode === 'zero') {
      localStorage.removeItem('selfie.f1rst');
    }

    if (this.state.selfie) {
      localForage.setItem('selfie.src', this.state.selfie);
    } else {
      localForage.removeItem('selfie.src');
    }
    if (this.state.mascote) {
      localForage.setItem('mascote.src', this.state.mascote);
    } else {
      localForage.removeItem('mascote.src');
    }
  },

  setCameraStream: function (stream, mediaStreamObject) {
    var n_state = {
      stream: stream,
      selfie: null,
      mediaStreamObject: mediaStreamObject
    };

    if (!this.state.mascote) {
      n_state.mascote = this.state.mascotes[0].full;
    }

    this.setState(n_state);
  },

  captureCamera: function (mediaStreamObject) {

    this.setState({captureVideo: true}, function () {

      var video = this.refs.streamVideo.getDOMNode();
      var videoSize = {width: video.videoWidth, height: video.videoHeight};
      var $container = $(this.refs.container.getDOMNode());
      var container = {width: $container.width(), height: $container.height()};


      if (container.width > container.height) {
        videoSize.width = container.width;
        videoSize.height = videoSize.height * (container.width / video.videoWidth);
      } else {
        videoSize.height = container.height;
        videoSize.width = videoSize.width * (container.height / video.videoHeight);
      }

      var streamCanvas = this.refs.streamCanvas.getDOMNode();
      var ctx = streamCanvas.getContext('2d');

      var $canvas = $(streamCanvas);

      $canvas.attr('width', videoSize.width).attr('height', videoSize.height);
      $canvas.width(videoSize.width).height(videoSize.height);

      ctx.drawImage(video, 0, 0, videoSize.width, videoSize.height);

      mediaStreamObject.stop();

      this.setState({
        stream: null,
        captureVideo: false,
        selfie: streamCanvas.toDataURL('image/jpeg', 0.85),
        mediaStreamObject: null,
        mode: 'check'
      }, this.saveToLocalStorage);

    }.bind(this));
  },

  selfieSelector: function () {
    this.setState({
      mode: 'initial',
      selfie: null,
      mascote: null
    }, this.saveToLocalStorage);
  },

  saveToDataURL: require('./selfie.save.canvas.jsx'),

  goToSaveMenu: function () {
    this.setState({captureCanvas: true, mode: 'save', selected: null}, this.saveToDataURL);
  },

  exitSave: function () {
    this.setState({
      mode: 'initial',
      savedURL: null,
      selfie: null,
      mascote: null
    });
  },

  setSelected: function (name) {
    this.setState({selected: name});
  },

  togglePopup: function () {
    this.setState({isPopupMenuVisible: !!!this.state.isPopupMenuVisible});
  },

  resizeWrap: function () {
    if (this.state.mode === 'zero') return;

    var $container = $(this.refs.container.getDOMNode());
    var $wrap = $(this.refs.wrap.getDOMNode());
    var totalHeight = $container.height();
    return;
    $wrap.css({
      height: totalHeight * 0.9,
      'margin-top': totalHeight * 0.075,
      'margin-bottom': totalHeight * 0.025
    });
  },

  componentDidUpdate: function () {
    if (this.state.mode !== 'zero' && Modernizr.localstorage) localStorage.setItem('selfie.f1rst', true);
    this.resizeWrap();
  },

  doReset: function () {
    this.setState({selfie: null, mascote: null, mode: 'zero'}, this.saveToLocalStorage);
  },

  doClose: function () {
    localStorage.removeItem('selfie.f1rst');
    localForage.removeItem('selfie.src');
    localForage.removeItem('mascote.src');
    this.props.onClose();
  },

  fullRender: function (landscapeViewPort, viewPort, mainClasses) {
    var Menu, canvasClasses;
    var hasRightMenu = (this.state.mode !== 'save' && (this.state.stream || this.state.mode !== 'initial'));
    var horizontalSplitClasses = React.addons.classSet({
      fullCam: !hasRightMenu,
      largeSides: this.state.mode === 'save'
    });

    Menu = Menus[this.state.mode];

    canvasClasses = React.addons.classSet({
      isEmpty: this.state.mode === 'initial' && !this.state.stream,
      fullWrapper: true
    });

    var imgSuffix = '';

    if (this.props.locales[0].substr(0, 2) !== 'pt') {
      imgSuffix = '-en';
    }

    return (
      <div id='SelfieApp' className={mainClasses} style={viewPort}>
        <div className='fullWrapper'>
          {this.props.onClose && <a id='SelfieClose' title={this.getIntlMessage('close')} onClick={this.doClose}>{'×'}</a>}
          <div id='FlexRow' className={horizontalSplitClasses}>
            <div id='FlexRowLeft'>

              <div id='FlexColumn'>

                <div id='FlexColumnTop' ref='container'>

                  {landscapeViewPort && this.state.mode === 'initial' && !this.state.stream
                    ? <img className='floatingMascote' id='SelfieInitialMascote1' src={app_base + 'img/mascotes/a/tela1-mascote1' + imgSuffix + '.png'} /> : null}

                  {landscapeViewPort && this.state.mode === 'initial' && !this.state.stream
                    ? <img className='floatingMascote' id='SelfieInitialMascote2' src={app_base + 'img/mascotes/a/tela1-mascote2' + imgSuffix + '.png'} /> : null}

                  {landscapeViewPort && this.state.mode === 'save'
                    ? <img className='floatingMascote' id='SelfieSaveMascote1' src={app_base + 'img/mascotes/a/tela5-mascote1.png'} /> : null}

                  {landscapeViewPort && this.state.mode === 'save'
                    ? <img className='floatingMascote' id='SelfieSaveMascote2' src={app_base + 'img/mascotes/a/tela5-mascote2.png'} /> : null}

                  <div className={canvasClasses} id='CanvasWrapper' ref='wrap'>
                      { this.state.stream && this.state.mode === 'initial'
                        ? <Video ref='streamVideo' src={this.state.stream} viewPort={viewPort} /> : null }

                      { this.state.captureCanvas && this.state.mode === 'save'
                        ? <Canvas ref='captureCanvas' viewPort={viewPort} /> : null }

                      { this.state.captureVideo && this.state.mode === 'initial'
                        ? <Canvas ref='streamCanvas' viewPort={viewPort} /> : null }

                      { this.state.selfie && this.state.mode !== 'initial'
                        ? <CanvasImg selected={this.state.selected === 'selfie' && this.state.mode !== 'save'}
                            src={this.state.selfie}
                            name={'selfie'} ref={'selfie'}
                            orientation={this.state.orientation}
                            selectMe={this.setSelected}
                            locked={this.state.mode === 'save'}
                            keepRatio={false} defaultTo={'parent'} /> : null }

                      { this.state.mascote && (this.state.mode !== 'initial' || this.state.stream)
                        ? <CanvasImg selected={this.state.selected === 'mascote' && this.state.mode !== 'save'}
                            name={'mascote'} ref={'mascote'}
                            orientation={this.state.orientation}
                            selectMe={this.setSelected}
                            src={this.state.mascote}
                            locked={this.state.mode === 'save'}
                            keepRatio={true} defaultTo={'icon'} /> : null }
                      {this.state.mode === 'save' && <div className='fullWrapper' style={{
                        zIndex: 2,
                        left: 0, top: 0,
                        position: 'absolute'
                      }} />}


                  </div>
                </div>

                <div id='FlexColumnBottom'>
                  <div className='fullWrapper'>
                    { this.state.mode !== 'save' && this.state.mode !== 'initial' && !landscapeViewPort
                      ? <PopUpMenu setImage={this.setImage} ref='popUpMenu' mascotes={this.state.mascotes}
                          visible={this.state.isPopupMenuVisible} mascotes={this.state.mascotes} selected={this.state.mascote} />
                            : null
                      }

                    <Menu ref='bottomMenu' hasOpenStream={!!this.state.stream}
                      togglePopup={!landscapeViewPort && this.state.mode === 'check' ? this.togglePopup : null}
                      makeAlert={this.makeAlert}
                      orientation={this.state.orientation}
                      canCapture={!!this.state.mascote}
                      highlight={!this.state.mascote}
                      goToSaveMenu={this.goToSaveMenu}
                      allSet={!!this.state.selfie && !!this.state.mascote}
                      exitSave={this.exitSave} canvasDataURL={this.state.savedURL}
                      setImage={this.setImage} selfieSelector={this.selfieSelector}
                      setCameraStream={this.setCameraStream}
                      captureCamera={this.captureCamera} />

                  </div>

                </div>

              </div>

            </div>
            { landscapeViewPort &&
            <div id='FlexRowRight'>
                  { hasRightMenu

                    ? <SideMenu setImage={this.setImage} ref='sideMenu'
                        mascotes={this.state.mascotes} selected={this.state.mascote}
                        highlight={true} />
                    : null
                    }
            </div>
              }
          </div>

          <img id='SelfieLogo' onDoubleClick={this.doReset} src={app_base + 'img/selfie-logo' + imgSuffix + '.png'} />

          <ErrList errors={this.state.errors} dismissError={this.dismissError} />
        </div>
      </div>
    );
  },

  exitSplashScreen: function () {
   this.setState({mode: 'initial'});
  },

  render: function () {

    var $window = $(window);
    var landscapeViewPort = this.state.orientation === 'landscape';
    var viewPort = {width: $window.width(), height: $window.height()};
    var classesObj = {landscape: landscapeViewPort, portrait: !landscapeViewPort};

    classesObj[this.props.locales[0].substr(0, 2)] = true;

    var mainClasses = React.addons.classSet(classesObj);

    if (this.state.mode !== 'zero') {
      return this.fullRender(landscapeViewPort, viewPort, mainClasses);
    }

    return (
      <div id='SelfieApp' className={mainClasses} style={viewPort}>
        {this.props.onClose && <a id='SelfieClose' title={this.getIntlMessage('close')} onClick={this.props.onClose}>{'×'}</a>}
        <img id='SelfieBkg' src={app_base + 'img/bg-tela0.png'} />

          <div id='SelfieTela0Content'>
            <div id='SelfieTela0Logo'></div>
            <article dangerouslySetInnerHTML={{__html:
              this.getIntlMessage('welcome.paragraph')
            }}></article>
            <button className='sBt lameHover' id='SelfieBtSkip' onClick={this.exitSplashScreen}>
              {this.getIntlMessage('welcome.proceed')}</button>
          </div>

          <div id='SelfieTela0Mascotes'></div>
      </div>
    );

  }
});

var Public = {};

Public.component = Selfie;
Public.messages = require('./messages');

module.exports = Public;