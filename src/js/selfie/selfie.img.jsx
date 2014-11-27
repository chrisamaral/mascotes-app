  /** @jsx React.DOM */
var Hammer = require('../ext/hammer.min.js');
var localForage = require('localforage');
var async = require('async');

require('../ext/draggabilly.pkgd.js');

function compareSrc(a, b) {
  return !!a === !!b && a.substr(0 - b.length) === b;
}

function toRadians(angle) {
	return angle * (Math.PI / 180);
}

var K = require('./selfie.img.keyboard.js');

var Img = React.createClass({
  mixins: [ReactIntlMixin],
  retrieveFromCache: function () {
    localForage.getItem(this.props.name + '.src')
      .then(function (src) {
        if (!compareSrc(src, this.props.src)) return this.setState({canHasDefault: 'yes'});

        async.map(

          ['left', 'width', 'height', 'top'],

          function (item, callback) {
            var key = this.props.name + '.' + item;
            localForage.getItem(key, function (err, val) {
              if (err) return callback(err);

              callback(null, val ? {key: item, val: val} : null);
            });

          }.bind(this),

          function (err, results) {
            if (err) return console.log(err);
            var state = {canHasDefault: 'no'};

            results.forEach(function (val) {
              if (!val) return;
              state[val.key] = val.val;
            });

            this.setState(state);
          }.bind(this)
        );

      }.bind(this));
  },
  writeState: function () {
    if (!Modernizr.localstorage || window.cordova) return;

    var name = this.props.name;

    _.forEach(['left', 'width', 'height', 'top'], function (key) {
      localForage.setItem(name + '.' + key, this.state[key]);
    }, this);
  },

	getInitialState: function () {
    return {left: null, top: null, width: null, height: null, canHasDefault: 'notYet'};
	},

	stretchToParent: function () {

    function orientation (width, height) {
      return width < height ? 'portrait' : 'landscape';
    }

		var img = this.refs.img.getDOMNode();
    var $parent = $(this.getDOMNode()).parent();
    var container = {width: $parent.outerWidth(), height: $parent.outerHeight()};
    var ratio = (container.height * 1.2) / img.naturalHeight;
    var containerOrientation = orientation(container.width, container.height);

    if (containerOrientation === 'landscape') ratio = (container.width * 1.2) / img.naturalWidth;

    this.state.height = img.naturalHeight * ratio;
    this.state.width = img.naturalWidth * ratio;

    if (this.state.height < container.height * 1.2) {
      this.state.width = this.state.width * ((container.height * 1.2) / this.state.height);
      this.state.height = container.height * 1.2;
    }

    if (this.state.width < container.width * 1.2) {
      this.state.height = this.state.height * ((container.width * 1.2) / this.state.width);
      this.state.width = container.width * 1.2;
    }

    this.state.left = (container.width - this.state.width) * 0.5;
    this.state.top = (container.height - this.state.height) * 0.5;

    this.setState(this.state, this.writeState);
	},

	resizeToIcon: function () {
		var img = this.refs.img.getDOMNode();
    var $parent = $(this.getDOMNode()).parent();
    var dimensions = {width: $parent.outerWidth(), height: $parent.outerHeight()};

		if (dimensions.width > dimensions.height) {
      this.state.height = dimensions.height * 0.75;
      this.state.width = img.naturalWidth * (this.state.height / img.naturalHeight);
		} else {
      this.state.width = dimensions.width * 0.75;
      this.state.height = img.naturalHeight * (this.state.width / img.naturalWidth);
		}

		this.state.left = (dimensions.width * 0.95) - this.state.width;
		this.state.top = (dimensions.height - this.state.height) * 0.5;
		this.setState(this.state, this.writeState);
	},

	savePos: function (instance, event, pointer) {
		this.setState({left: instance.position.x, height: instance.position.y});
	},

  dragCheck: function (inst) {
    var $elem = $(this.getDOMNode()), pos = $elem.position();
    var nState = {
      width: $elem.width(),
      height: $elem.height(),
      top: pos.top,
      left: pos.left
    }, $parent;

    if (!this.validateState(nState)) {
      inst.disable();
      $parent = $(this.getDOMNode()).parent();

      if (nState.left > 0) {

        nState.left = ($parent.outerWidth() - nState.width) * 0.5;

      } else if (nState.left + nState.width < $parent.outerWidth()) {

        nState.left = ($parent.outerWidth() - nState.width) * 0.5;

      } else if (nState.top > 0) {

        nState.top = ($parent.outerHeight() - nState.height) * 0.5;

      } else if (nState.top + nState.height < $parent.outerHeight()) {

        nState.top = ($parent.outerHeight() - nState.height) * 0.5;

      }

      this.setState(nState);

      //this.stretchToParent();

      setTimeout(inst.enable.bind(inst), 100);

      return false;
    }

  },

  onResize: function () {
    if (!this.isMounted()) {
      return;
    }

    _.delay(function () {
      if (!this.validateState(this.state)) return this.stretchToParent();
    }.bind(this), 300);
  },

  componentWillUnmount: function () {
    $(window).off('resize', this.onResize);
  },

	componentDidMount: function () {
		var img = this.refs.img.getDOMNode(),
        elem = this.getDOMNode(),
        hammertime;

    $(window).on('resize', _.throttle(this.onResize, 300));

		if (this.undefinedSize() && img.complete) this.setDefaultSize();
    
    this.triggerKeyboard();

    if (Modernizr.touch) {
		  hammertime = new Hammer(elem);
      
      /*
        não funciona
        hammertime.on('doubletap', this.clickZoom);
      */

  		hammertime.get('pinch').set({enable: true});
  		hammertime.on('pinch', this.onPinch);
      hammertime.on('pinchstart', function (e) {
        this.selectMe();
        containerDrag.disable();
      }.bind(this));

  		hammertime.on('pinchend', function (e) {
        containerDrag.enable();

        var $elem = $(this.getDOMNode()),
            pos = $elem.position();

        this.setState({
          left: pos.left,
          top: pos.top,
          width: $elem.width(),
          height: $elem.height()
        }, this.writeState);
      }.bind(this));
      this.__hammer = hammertime;
    }
    var containerDrag = new Draggabilly(elem);

    containerDrag.on('dragMove', this.dragCheck);

    containerDrag.on('dragStart', function () {
      this.selectMe();
    }.bind(this));

		containerDrag.on('dragEnd',   this.onDragEnd);
    $(elem).on('click', this.selectMe);
    
    this.__draggie = containerDrag;
    this.retrieveFromCache();
	},

  onDragEnd: function (instance) {
    this.setState({left: instance.position.x, top: instance.position.y}, this.writeState);
  },

	onPinch: function (e) {
		var $elem = $(this.getDOMNode()), 
        oldWidth = $elem.width(), 
        oldHeight = $elem.height(),
        newWidth = this.state.width * e.scale, 
        newHeight = this.state.height * e.scale,
        pos = $elem.position();

    var nState = {
      width: newWidth,
      height: newHeight,
      left: pos.left - (newWidth - oldWidth) / 2,
      top: pos.top - (newHeight - oldHeight) / 2
    };

    if (!this.validateState(nState)) return;

    $elem.width(nState.width);
		$elem.height(nState.height);

    delete nState.width;
    delete nState.height;

    $elem.css(nState);
	},

	undefinedSize: function () {
		return this.state.left === null;
	},

	componentWillReceiveProps: function (props) {

		if (this.props.src !== props.src) {

      this.setState({
				left: null,
				top: null,
				width: null,
				height: null,
        canHasDefault: 'yes'
			});

		} else if (this.props.orientation !== props.orientation) {
      setTimeout(this.setDefaultSize, 10);
    }
	},

	setDefaultSize: function () {
    if (this.state.canHasDefault !== 'yes') return;
		if (this.props.defaultTo === 'parent') {
			this.stretchToParent();
		} else if (this.props.defaultTo === 'icon') {
			this.resizeToIcon();
		}
	},
	
	componentDidUpdate: function () {
		if (this.undefinedSize() && this.refs.img.getDOMNode().complete) this.setDefaultSize();
    this.triggerKeyboard();
	},

  clickZoom: function () {
    if (this.props.locked) return;

    this.setState({
      width: this.state.width * 2,
      height: this.state.height * 2,
      left: this.state.left - this.state.width * 0.5,

      top: this.state.top - this.state.height * 0.5
    });
  },

  validateState: function (nState) {
    if (this.props.defaultTo !== 'parent') return true;

    var $parent = $(this.getDOMNode()).parent();
    if (nState.left > 0) return false;
    if (nState.left + nState.width < $parent.outerWidth()) return false;
    if (nState.top > 0) return false;
    if (nState.top + nState.height < $parent.outerHeight()) return false;

    return true;
  },

  onMouseWheel: function (e) {
    if (this.props.locked) return;
    if (e.deltaY === 0) return;


    e.deltaY = e.deltaY > 0 ? 1 : -1;
    e.deltaY = -e.deltaY;


    var $elem = $(this.getDOMNode()),
        offset = $elem.offset();

    var cursorX = e.clientX - offset.left;
    var cursorY = e.clientY - offset.top;
    var newCursorX = cursorX + (cursorX * 0.1 * e.deltaY);
    var newCursorY = cursorY + (cursorY * 0.1 * e.deltaY);

    var nState = {
      width: Math.floor(this.state.width * (1 + 0.1 * e.deltaY)),
      height: Math.floor(this.state.height * (1 + 0.1 * e.deltaY)),
      left: Math.floor(this.state.left + cursorX - newCursorX),
      top: Math.floor(this.state.top + cursorY - newCursorY)
    };

    if (!this.validateState(nState)) return;

    this.setState(nState, this.writeState);
    e && e.preventDefault();
  },

  selectMe: function () {
    this.props.selectMe(this.props.name);
  },
  
  moveTop: K.moveTop,
  moveBottom: K.moveBottom,
  moveLeft: K.moveLeft,
  moveRight: K.moveRight,
  zoomIn: K.zoomIn,
  zoomOut: K.zoomOut,

  anyKey: function (event) {
    switch (event.which) {
      case 189:
      case 173:
        this.zoomOut(event);
        break;
      case 61:
        this.zoomIn(event);
        break;
      case 27:
        this.selectMe();
        break;
    }
  },

  triggerKeyboard: function () {
    
    var k = this.triggerKeyboard, jwerty;
    
    if (!k.eLeft) {
      jwerty = require('jwerty').jwerty;
      k.eLeft = jwerty.event('←', this.moveLeft);
      k.eRight = jwerty.event('→', this.moveRight);
      k.eTop = jwerty.event('↑', this.moveTop);
      k.eBottom = jwerty.event('↓', this.moveBottom);
      k.eZoomIn = jwerty.event('+=', this.zoomIn);
      k.eZoomOut = jwerty.event('-½', this.zoomOut);
    }

    if (!this.props.selected) {
      if (!k.trigged) return;

      $('body').off('keydown', k.eLeft)
        .off('keydown', k.eRight).off('keydown', k.eTop).off('keydown', k.eBottom)
        .off('keydown', k.eZoomIn).off('keydown', k.eZoomOut).off('keydown', this.anyKey);

      k.trigged = false;

      return;
    }
    
    if (k.trigged) return;

    $('body').on('keydown', k.eLeft)
        .on('keydown', k.eRight).on('keydown', k.eTop).on('keydown', k.eBottom)
        .on('keydown', k.eZoomIn).on('keydown', k.eZoomOut).on('keydown', this.anyKey);

      k.trigged = true;
  },

	render: function () {
		var wrapperStyle = {
			width: this.state.width,
			height: this.state.height,
			left: this.state.left,
			top: this.state.top
		};

    //if (this.props.locked) wrapperStyle.display = 'none';

    var classes = React.addons.classSet({
      selected: this.props.selected,
      ImgContainer: true
    });
    var handlerStyle = {position: 'absolute'};
		return (
      <div className={classes} style={wrapperStyle} onDoubleClick={this.clickZoom} onWheel={this.onMouseWheel} >
        <div className='fullWrapper'>
          <img ref='img' src={this.props.src} onLoad={this.setDefaultSize}
              width={wrapperStyle.width} height={wrapperStyle.height} />
        </div>
      </div>
    );
    /*

     */
	}
});

module.exports = Img;