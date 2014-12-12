//require('./../ext/fetch');
var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

var Sport = React.createClass({
  mixins: [ReactIntlMixin],
  getInitialState: function () {
    return {text: null};
  },

  renderText: function () {
    this.refs.descr.getDOMNode().innerHTML = this.state.text;
  },

  knowMore: function (e) {
    e.preventDefault();

    if (this.props.slideTo) return this.props.slideTo(e);

    this.props.expandText();
    if (this.state.text) return this.renderText();

    this.fetchText();
  },

  fetchText: function () {

    $.get(app_base + 'text/' + this.context.locales[0].substr(0, 2) +
      '/sports/' + this.props.sport.category + '/' + this.props.sport.id.toLowerCase() + '.html')
        .done(function (response) {
          this.setState({text: response}, this.renderText);
        }.bind(this));
  },

  componentWillReceiveProps: function (props) {
    this.props = props;
    this.state.text && this.fetchText();
  },

  resizeSportInfo: function () {
    $(this.refs.img.getDOMNode()).css('height', '');
  },

  resize: function () {

    if (this.state.text && this.props.index === 1) {
      return this.resizeSportInfo();
    }

    var $img = $(this.refs.img.getDOMNode()),
        $info = $(this.refs.info.getDOMNode());

    $img.height($info.parent().height() - $info.height());
  },

  componentDidUpdate: function () {
    this.resize();
  },

  componentDidMount: function () {
    _.delay(this.resize, 500);
    this.__resizeHandler = _.throttle(this.resize, 200);
    $(window).on('resize orientationchange', this.__resizeHandler);
  },

  componentWillUnmount: function () {
    $(window).off('resize orientationchange', this.__resizeHandler);
  },

  openInBrowser: function (e) {
    e.preventDefault();
    window.open(e.target.href, '_system');
  },

  render: function () {
    var sport = this.props.sport;
    var showText = this.props.expanded && this.state.text && this.props.index === 1;
    var classes = React.addons.classSet({
      AFSport: true,
      expanded: showText,
      middle: this.props.index === 1,
      first: this.props.index === 0,
      last: this.props.index === 2
    });

    var img = app_base + 'img/cards/' + sport.category + '/' + sport.id + '.png';
    var anchorHandler = window.fromCordova ? this.openInBrowser : null;

    return (
      <div className={classes} onClick={this.props.slideTo}>
        <div className='inner'>
          <div className='AFSPortContent inner'>

            <div className='inner'>

              <div ref='img' className='AFSportImg'>
                <div className='inner'>
                  <div className='img' style={{background: 'url(' + img + ') center/contain no-repeat'}}></div>
                </div>
              </div>

              <div ref='info' className='AFInfo'>

                <div className='inner AFInfoWrapper' ref='scrollable'>
                  <div className='inner AFInfoTB'>
                    <div className='inner AFInfoExpansible' ref='expansible'>
                      <h2>
                        <span>{sport.name}</span>
                      </h2>
                      {showText ? <article ref='descr'></article> : null}
                      {showText
                          ? <div className='AFDoSomething'>
                              <a className='AFBTSportDetails AFPopBt'
                                href={sport.url ? sport.url : 'http://google.com/search?q=' + sport.name}
                                target='_blank' onClick={anchorHandler}>
                                  {this.getIntlMessage('result.evenmore')}
                              </a>

                              <div className='share'>
                                <span className='share-this'>{this.getIntlMessage('result.shareme')}</span>
                                <a target='_blank' className='share-tw AFPopBt' href={this.props.twitterUrl} onClick={anchorHandler}>&zwnj;</a>
                                <a target='_blank' className='share-fb AFPopBt' href={'http://www.facebook.com/sharer/sharer.php?u=' + this.props.appReferenceURL()} onClick={anchorHandler}>&zwnj;</a>
                              </div>

                            </div>
                        : null}


                        {!this.state.text
                          &&
                          <div>
                            <a className='AFBTSportDetails AFPopBt' href='' onClick={this.knowMore}>
                              {this.getIntlMessage('result.showmore')}
                            </a>
                          </div>
                        }
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }
});

function prevInList (len, pos) {
  pos--;
  if (pos < 0) pos = len - 1;
  return pos;
}

function nextInList (len, pos) {
  pos++;
  if (pos >= len) pos = 0;
  return pos;
}

function sportID(sport) {
  return sport.category + '.' + sport.id;
}
var Sports = React.createClass({
  mixins: [ReactIntlMixin],

  getInitialState: function () {
    var state = {currentIndex: 0, expanded: false}, found;

    if (typeof sys_args !== 'undefined' && sys_args.params && sys_args.params[1]) {

      found = _.findIndex(this.props.sports,
        function (s) {
          return sportID(s) === sys_args.params[1];
        }
      );

      if (found > -1) {
        state.currentIndex = found;
      }
    }

    return state;
  },
  expandText: function () {
    this.setState({expanded: true});
  },
  reset: function (e) {
    e.preventDefault();
    this.props.reset();
  },

  prev: function (e) {
    e.preventDefault();
    this.props.prev();
  },

  slideNext: function (e) {
    e && e.preventDefault();
    e && e.stopPropagation();

    this.setState({currentIndex: nextInList(this.props.sports.length, this.state.currentIndex)});
  },

  slidePrev: function (e) {
    e && e.preventDefault();
    e && e.stopPropagation();

    this.setState({currentIndex: prevInList(this.props.sports.length, this.state.currentIndex)});
  },

  componentDidUpdate: function () {
    this.props.updateURL();
    this.mountGoBackLink();
  },

  mountGoBackLink: function () {
    $('#AFSportsGoBack').remove();

    $(this.getDOMNode()).closest('.AF').append(
      $(
        React.renderToStaticMarkup(
          <a id='AFSportsGoBack' className={React.addons.classSet({expanded: this.state.expanded, hoverable: true})} href=''>{this.getIntlMessage('result.back')}</a>
        )
      ).on('click', this.reset)
    );
  },

  appReferenceURL: function () {

    if (!window.fromCordova) {
      return window.location.href;
    }

    return this.getIntlMessage('url');
  },

  componentDidMount: function () {
    this.mountGoBackLink();
  },

  componentWillUnmount: function () {
    $('#AFSportsGoBack').remove();
  },

  render: function () {

    var sports = this.props.sports.concat();
    var pos = this.state.currentIndex;
    var slide = [];

    slide.push(pos === 0
      ? sports[sports.length - 1]
      : sports[pos - 1]);

    slide.push(sports[pos]);

    slide.push(pos === sports.length - 1
      ? sports[0]
      : sports[pos + 1]);

    var sports_names = _.map(sports, 'name');
    var shareText = this.formatMessage(this.getIntlMessage('result.share_text'), {
      count: sports_names.length,
      sports: sports_names.join(', ')
    });

    var twitterUrl = encodeURI('http://twitter.com/intent/tweet?text=' + shareText + '&url=' + this.appReferenceURL());

    return <div id='AFSports' className={React.addons.classSet({expanded: this.state.expanded})}>
      <header>
        <div id='AFLogo'></div>
        <span id='AFCoolStoryBro' dangerouslySetInnerHTML={{__html:
          this.formatMessage(
            this.getIntlMessage('result.coolstorybra'),
            {count: sports.length}
          )
          }}></span>
      </header>
      <a id='AFSlidePrev' href='' className='AFNavBt left' onClick={this.slidePrev}>{'←'}</a>
      <section>
        {_.map(slide, function (slide, index) {
          var slideF;
          if (index === 0) slideF = this.slidePrev;
          if (index === 2) slideF = this.slideNext;
          return <Sport slideTo={slideF} index={index} key={index} appReferenceURL={this.appReferenceURL}
            ref='prevSport' expanded={this.state.expanded} sport={slide}
            twitterUrl={twitterUrl} expandText={this.expandText} />;
        }, this)}
      </section>
      <div id='AFSportsIndex'>{
        this.formatMessage(
          this.getIntlMessage('result.index'),
          {
            currentIndex: pos + 1,
            total: sports.length
          }
        )
      }</div>
      <a id='AFSlideNext' href='' className='AFNavBt right' onClick={this.slideNext}>{'→'}</a>

    </div>;
  }
});
module.exports = Sports;