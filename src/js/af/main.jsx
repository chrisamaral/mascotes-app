var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;
var opts = ['a', 'b', 'c', 'd', 'e'];



var Option = React.createClass({
  mixins: [ReactIntlMixin],

  handleCheck: function () {
    this.props.check(this.props.index);
  },

  componentDidMount: function () {

  },

  render: function () {
    var id = 'AFCheck' + this.props.index;

    return (
      <li className={React.addons.classSet({selected: this.props.selected})} onClick={this.handleCheck}>
        <label htmlFor={id} className='inner'>

          <input id={id} type='checkbox' name={'answer'} checked={this.props.selected}
              value={this.props.index} onChange={this.handleCheck} />

          <span className='AFOptLetter'><span>{opts[this.props.index]}</span></span>
          <span className='AFOptText'>{this.props.a}</span>

        </label>
      </li>
    );
  }
});

var Question = React.createClass({
  mixins: [ReactIntlMixin],
  getInitialState: function () {
    return {selected: null};
  },
  componentWillReceiveProps: function () {
    this.setState({selected: null});
  },
  check: function (index) {
    this.setState({selected: index});
  },
  prev: function (e) {
    e.preventDefault();
    this.props.prev();
  },
  next: function (e) {
    e.preventDefault();
    this.props.next(this.state.selected);
  },
  render: function () {
    var selected = this.state.selected;
    function cancel (e) {
      e.preventDefault();
    }

    var prevClasses = React.addons.classSet({
      AFButtonFlow: true,
      prev: true,
      AFNavBt: !!this.props.prev,
      left: true,
      disabled: !this.props.prev
    });

    var nextClasses = React.addons.classSet({
      AFButtonFlow: true,
      AFNavBt: selected !== null,
      right: true,
      next: true,
      disabled: selected === null
    });

    return (
      <form id='AFQuestionForm' onSubmit={this.next}>
        <header>
          <div id='AFLogo'></div>
        </header>
        <p id='AFQuestion'>
          <span>{this.props.q}</span>
        </p>
        <fieldset>
          <img src='img/af-mascote-esquerda.png' />

          <ul>
            {
              _.map(this.props.a, function (option, index) {
                return <Option selected={selected === index}
                  check={this.check} key={index} index={index} a={option} />;
              }, this)
            }
      </ul>

      <img src='img/af-mascote-direita.png' />
    </fieldset>
        <div id='AFNavigation'>
          <a href='' className={prevClasses} type='submit' onClick={this.props.prev ? this.prev : cancel}>{'<'}</a>
          <a href='' className={nextClasses} type='submit' onClick={selected !== null ? this.next : cancel}>{'>'}</a>
        </div>
      </form>
    );
  }
});

var WelcomeScreen = React.createClass({
  mixins: [ReactIntlMixin],
  next: function (e) {
    e.preventDefault();
    this.props.next();
  },
  render: function () {
    return (
      <section id='AFWelcome'>
        <div id='AFWelcomeLeft'>
          <div className='inner'>

            <div id='AFLogo'></div>

            <div id='AFWelcomeText'>
              <article dangerouslySetInnerHTML={{__html:
                this.getIntlMessage('welcome.paragraph')
              }}></article>
            </div>

            <div id='AFWelcomeAction' className='text-center'>
              <a href='' className='hoverable' onClick={this.next}>
              {this.getIntlMessage('welcome.proceed')}
              </a>
            </div>

          </div>
        </div>
        <div id='AFWelcomeRight'></div>
      </section>
    );
  }
});

var Sports = require('./sports');
var $window = $(window);

var AF = React.createClass({
  mixins: [ReactIntlMixin],

  getInitialState: function () {
    var state = {path: null};

    if (typeof sys_args !== 'undefined' && sys_args.env === 'standalone') {

      if (sys_args.params && sys_args.params[0]) {
        state.path = sys_args.params[0];
      }

      state.liveURL = true;

      if (_.isNumber(state.path)) {
        state.path = '' + state.path;
      }
    }

    return state;
  },

  reset: function (e) {
    e && e.preventDefault();
    this.setState({
      slideBack: true,
      path: null
    });
  },

  init: function () {
    this.setState({
      slideBack: false,
      path: ''
    });
  },

  prev: function (e) {
    this.setState({
      slideBack: true,
      path: this.state.path ? this.state.path.substr(0, this.state.path.length - 1) : null
    });
  },

  next: function (answer) {
    this.setState({
      slideBack: false,
      path: (this.state.path || '') + answer
    });
  },

  getCleanPath: function () {
    if (!this.state.liveURL) return;

    return [
      sys_args.base_url,
      'app',
      sys_args.lang,
      'af',
      this.state.path || ''
    ];

  },

  updateURL: function () {
    if (!Modernizr.history || !this.state.liveURL) return;

    function sportID(sport) {
      return sport.category + '.' + sport.id;
    }

    var path = this.getCleanPath();

    if (!path) return;

    var url = path.join('/');
    var Sports = this.refs.sports;

    if (Sports) {
      url = url + '~' + sportID(Sports.props.sports[Sports.state.currentIndex]) +
      '~' + _.map(Sports.props.sports, sportID);
    }

    if (url === window.location.pathname) return;

    history.replaceState(
      {path: history.state},
      '',
      url
    );
  },
  componentDidUpdate: function () {
    this.updateURL();
  },
  onResize: function () {
    if (!this.isMounted()) {
      return;
    }
    var $parent = $(this.getDOMNode()).parent(), windowHeight = $window.height();
    $parent.css('min-height', windowHeight);

    if ($parent.height() < windowHeight) {
      $parent.css('height', windowHeight);
    }

    this.forceUpdate();
  },

  componentDidMount: function () {
    $window.on('resize', this.onResize);
    this.onResize();
  },

  componentWillUnmount: function () {
    $window.off('resize', this.onResize);
  },

  navigate: function (path, current) {
    current = current || this.props.flow;

    if (!path || !path.length) return current;

    var next = current['a' + path.charAt(0)];
    var newPath = path.substr(1);

    if (!newPath || !newPath.length) {
      return next;
    }

    return this.navigate(newPath, next);
  },

  render: function () {
    var inner, currentNode;

    if (this.state.path === null) {

      inner = <WelcomeScreen key='welcomeView' next={this.init} />;

    } else {
      currentNode = this.navigate(this.state.path);
      inner = currentNode instanceof Array
          ? <Sports sports={currentNode} key='sportsView' ref='sports' prev={this.prev} updateURL={this.updateURL} reset={this.reset} path={this.state.path} liveURL={!!this.state.liveURL} />
          : <Question q={currentNode.q.q} key='questionView' a={currentNode.q.a} next={this.next} prev={this.prev} />;
    }

    return <div id='AFContainer' className={this.props.locales[0].substr(0, 2)}>
      {this.props.onClose && <a id='AFClose' title={this.getIntlMessage('close')} onClick={this.props.onClose}>{'×'}</a>}
      <div className='AFContent'>
        {inner}
      </div>
    </div>;
  }
});

var messages = require('./messages');
var Flow = require('./flow.js');

function startAtletaDoFuturo(container, lang, onClose) {

  function render (lang) {

    $(container).addClass('AF');
    var m = messages[lang];
    var closable;

    if (onClose) {
      closable = function () {

        onClose(function () {
          React.unmountComponentAtNode(container);
        });
      };
    }

    React.unmountComponentAtNode(container);
    React.render(
      <AF onClose={closable} flow={Flow(lang)}
        messages={m.messages} locales={m.locales} />,

      container || document.body);
  }

  render(lang);
  return render;
}
window.AtletadoFuturo = startAtletaDoFuturo;

if (!window.Intl) {
  window.Intl = require('intl');
}

var Public = {};

Public.component = AF;
Public.Flow = Flow;
Public.messages = messages;

module.exports = Public;