/** @jsx React.DOM */
var Hammer = require('../ext/hammer.min.js');

function compareSrc(a, b) {
	return !!a === !!b && a.substr(0 - b.length) === b;
}

var SideMenuItem = React.createClass({
  mixins: [ReactIntlMixin],
	getInitialState: function () {
		return {loaded: false};
	},
	
	selectMe: function () {
		this.props.setMascote(this.props.mascote.full);
	},
	
	componentDidMount: function () {
		if (this.refs.img.getDOMNode().complete) this.loadCallback();

		$(this.getDOMNode()).on('tap', this.selectMe);
	},
	
	loadCallback: function () {
		this.setState({loaded: true}, this.props.checkCompletion);
	},

	render: function () {
		
		var classes = React.addons.classSet({
			SelfieSideMenuItem: true,
			loaded: this.state.loaded,
			selected: this.props.selected,
      lameHover: true
		});

		return <li className={classes} onClick={this.selectMe}>
			<img ref='img' src={this.props.mascote.mobThumb} onLoad={this.loadCallback}></img>
		</li>
	}
});

var SideMenu = React.createClass({
  mixins: [ReactIntlMixin],
	slider: function () {
		var myScroll = new IScroll(this.refs.iscrollWrapper.getDOMNode(), {
		    mouseWheel: true,
		    scrollbars: false,
		    scrollY: true,
		    scrollX: false,
		    tap: true
		});
		
		var $elem = $(this.getDOMNode()), $selected = $elem.find('.selected');
		
		if ($selected.length) {
			myScroll.scrollToElement($selected[0]);
		}

		this.__iscroll = myScroll;
	},

	setMascote: function (src) {
		this.props.setImage('mascote', src);
	},

	checkCompletion: function () {
		var loaded = $(this.getDOMNode()).find('.SelfieSideMenuItem.loaded');
		if (this.props.mascotes.length && loaded.length === this.props.mascotes.length) {
			this.slider();
		}
	},
	
	scrollUp: function () {
		var $wrap = $(this.refs.iscrollWrapper.getDOMNode());
		this.__iscroll.scrollBy(0, $wrap.height() * 0.25, 500, IScroll.utils.ease.quadratic);
	}, 
	
	scrollDown: function () {
		var $wrap = $(this.refs.iscrollWrapper.getDOMNode());
		this.__iscroll.scrollBy(0, -$wrap.height() * 0.25, 500, IScroll.utils.ease.quadratic);
	},

	render: function () {
    var classes = React.addons.classSet({
      hasStupidAnimation: this.props.highlight
    });

		return (
			<div className='fullWrapper'>

				<div id='SelfieSideMenuWrapper' className={classes}>

          <div id='SideMenuBox'></div>

					<div id='IScrollWrapper' ref='iscrollWrapper'>
						<ul ref='ul' id='SelfieSideMenu'>
							{ this.props.mascotes.length
								? _.map(this.props.mascotes, function (mascote, index) {
									var isSelected = compareSrc(mascote.full, this.props.selected);
									return <SideMenuItem key={index} checkCompletion={this.checkCompletion}
												mascote={mascote} selected={isSelected} setMascote={this.setMascote} />;
								  }.bind(this))
								: null
							}
						</ul>
						
					</div>

					<a id='SideMenuScrollUp' className='lameHover' onClick={this.scrollUp} />
					<a id='SideMenuScrollDown' className='lameHover' onClick={this.scrollDown} />

				</div>
				
			</div>
		);
	}
});

module.exports = SideMenu;