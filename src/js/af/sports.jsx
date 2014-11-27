require('./../ext/fetch');
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
    if (this.state.text) return this.renderText();

    this.fetchText();
  },

  fetchText: function () {
    fetch('text/' + this.context.locales[0].substr(0, 2) +
      '/sports/' + this.props.sport.category + '/' +
      this.props.sport.id.toLowerCase() + '.html')
        .then(function (response) {
          return response.text();
        })
        .then(function (response) {
          this.setState({text: response}, this.renderText);
        }.bind(this));
  },

  componentWillReceiveProps: function (props) {
    this.props = props;
    this.state.text && this.fetchText();
  },

  resizeSportInfo: function () {

    var $scrollable, $expansible;


    /*
     $scrollable = $(this.refs.scrollable.getDOMNode());
     $expansible = $(this.refs.expansible.getDOMNode());
    if ($expansible.height() < $scrollable.height()) {
      $expansible.addClass('mid');
    } else {
      $expansible.removeClass('mid');
    }
    */

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
    $(window).on('resize', this.resize);
  },

  componentWillUnmount: function () {
    $(window).off('resize', this.resize);
  },

  shareToFB: function (e) {
    e.preventDefault();
    FB.ui({
      method: 'share',
      href: window.location.href
    });
  },

  render: function () {
    var sport = this.props.sport;
    var showText = this.state.text && this.props.index === 1;
    var classes = React.addons.classSet({
      AFSport: true,
      expanded: showText,
      middle: this.props.index === 1,
      first: this.props.index === 0,
      last: this.props.index === 2
    });

    var img = 'img/cards/' + sport.category + '/' + sport.id + '.png';

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
                              <a className='AFBTSportDetails AFPopBt' href={
                                  sport.url ? sport.url : '//google.com/search?q=' + sport.name
                                } target='_blank'>
                                  {this.getIntlMessage('result.evenmore')}
                              </a>
                              <div className='share'>
                                <span className='share-this'>{this.getIntlMessage('result.shareme')}</span>
                                <a target='_blank' className='share-tw AFPopBt' href={this.props.twitterUrl}>&zwnj;</a>
                                <a target='_blank' className='share-fb AFPopBt' href={'//www.facebook.com/sharer/sharer.php?u=' + window.location.href}>&zwnj;</a>
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
    var state = {currentIndex: 0}, found;

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

  _loadFB: function () {

    if (typeof FB !== 'undefined') return;
    window.fbAsyncInit = this._initFB;

    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

  },

  _initFB: function () {

    FB.init({
      appId: '336644193184527',
      //xfbml: true,
      version: 'v2.1'
    });

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
  },

  componentDidMount: function () {
    this._loadFB();

    $('#AFSportsGoBack').remove();

    $(this.getDOMNode()).closest('.AF').append(
      $(
        React.renderToStaticMarkup(
          <a id='AFSportsGoBack' className='hoverable' href=''>{this.getIntlMessage('result.back')}</a>
        )
      ).on('click', this.reset)
    );
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
    var sports_ids = _.map(sports, 'id');

    var shareText = this.formatMessage(this.getIntlMessage('result.share_text'), {
      count: sports_names.length,
      sports: sports_names.join(', ')
    });

    var twitterUrl = encodeURI('//twitter.com/intent/tweet?text=' + shareText + '&url=' + window.location.href);

    return <div id='AFSports'>
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
          return <Sport slideTo={slideF} index={index} key={index} ref='prevSport' sport={slide} twitterUrl={twitterUrl} />;
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