window.React = require('react/addons');

if (!window.intl) {
  window.Intl = require('intl');
}

window.ReactIntlMixin = require('react-intl');
window._ = require('./../ext/lodash.min.js');
window.Hammer = require('./../ext/hammer.min.js');

var $window = $(window);
var AFFlow = {en: null, pt: null};
var languages = [
  {id: 'en', title: 'English'},
  {id: 'pt', title: 'Português'}
];

var appList = ['af', 'selfie'];
var Atleta = require('../af/main.jsx');
var Selfie = require('../selfie/selfie.app.jsx');

var AppSelectorItem = React.createClass({
  mixins: [ReactIntlMixin],

  setApp: function (e) {
    e.preventDefault();
    this.props.selectApp(this.props.id);
  },

  render: function () {
    return <li>
      <a href='' onClick={this.setApp}>
        {this.getIntlMessage(this.props.id + '_title')}
      </a>
    </li>;

  }
});

var AppSelector = React.createClass({
  mixins: [ReactIntlMixin],

  render: function () {
    return <ul>
      {
        _.map(appList, function (app) {
          return <AppSelectorItem selectApp={this.props.selectApp} key={app} id={app} />;
        }, this)
        }
    </ul>;
  }
});

var Menu = React.createClass({
  mixins: [ReactIntlMixin],

  switchLang: function (e) {
    AppRenderer(e.target.value);
  },



  render: function () {

    var menuClasses = React.addons.classSet({
      hidden: !this.props.visible
    });

    return <nav id='Menu' className={menuClasses}>
      <div className='divisor'>{this.getIntlMessage('apps_divisor')}</div>

      <AppSelector selectApp={this.props.setApp} />

      <div className='divisor'>{this.getIntlMessage('langs_divisor')}</div>

      <select value={this.props.lang} onChange={this.switchLang}>
          {
            _.map(languages, function (l) {
              return <option key={l.id} value={l.id}>{l.title}</option>;
            })
            }
      </select>
    </nav>
  }
});

var R2016MascotesApp = React.createClass({
  mixins: [ReactIntlMixin],

  getInitialState: function () {
    var state = {
      visibleMenu: false,
      activeApp: null,
      windowHeight: $window.height(),
      windowWidth: $window.width()
    };

    if (Modernizr.localstorage) {
      state.activeApp = localStorage.getItem('r2016.currentApp') || null;
    }

    return state;
  },

  showOnClick: function (e) {
    e.preventDefault();
    this.showMenu();
  },

  showMenu: function () {
    this.setState({visibleMenu: true});
  },

  hideMenu: function () {
    this.setState({visibleMenu: false});
  },

  setApp: function (app) {
    if (Modernizr.localstorage) {
      localStorage.setItem('r2016.currentApp', app);
    }
    this.setState({activeApp: app});
  },

  componentDidMount: function () {
    var elem = this.getDOMNode();
    var hammertime = new Hammer(elem);

    hammertime.get('swipe').set({direction: Hammer.DIRECTION_HORIZONTAL});
    hammertime.on('swiperight', this.showMenu);
    hammertime.on('swipeleft', this.hideMenu);
    $window.on('resize orientationchange', _.throttle(function () {
      this.setState({
        windowHeight: $window.height(),
        windowWidth: $window.width()
      });
    }.bind(this), 200));
  },

  componentDidUpdate: function () {
    $('#ContentOverlay').remove();

    if (!this.state.visibleMenu) return;

    $(this.getDOMNode()).prepend($('<div id="ContentOverlay"></div>').on('click', this.hideMenu));
  },

  render: function () {
    var mainContent, SelectedComponent, localeData,
      windowHeight = this.state.windowHeight,
      mainClasses = React.addons.classSet({AF: this.state.activeApp === 'af'}),
      wrapperStyle = {minHeight: windowHeight};

    switch (this.state.activeApp) {

      case 'af':

        localeData = Atleta.messages[this.props.lang];
        SelectedComponent = Atleta.component;
        if (!AFFlow[this.props.lang]) {
          AFFlow[this.props.lang] = Atleta.Flow(this.props.lang);
        }
        mainContent = <SelectedComponent messages={localeData.messages} locales={localeData.locales} flow={AFFlow[this.props.lang]} />;

        break;

      case 'selfie':

        localeData = Selfie.messages[this.props.lang];
        SelectedComponent = Selfie.component;
        mainContent = <SelectedComponent messages={localeData.messages} locales={localeData.locales} />;

        break;

      default:
        mainContent = <h2>Preview dos aplicativos</h2>;
        break;
    }

    return <div id='App' style={{minHeight: this.state.windowHeight}}>

      <header id='Header'>
        <a id='Hamburger' href='' onClick={this.showOnClick}>
          <div>
            <div className='tick'>―</div>
            <div className='tick'>―</div>
            <div className='tick'>―</div>
          </div>
        </a>
        {this.getIntlMessage('app_title')}
      </header>

      <Menu lang={this.props.lang} height={this.state.windowHeight} visible={this.state.visibleMenu} setApp={this.setApp} />

      <main id='Main' className={mainClasses} style={wrapperStyle}>{mainContent}</main>

    </div>;
  }
});

var mainMessages = require('./messages');

function AppRenderer(lang) {
  React.render(<R2016MascotesApp lang={lang}
      locales={mainMessages[lang].locales} messages={mainMessages[lang].messages} /> ,
    document.body
  );
}

module.exports = AppRenderer;