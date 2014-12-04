/** @jsx React.DOM */

function compareSrc(a, b) {
  return !!a === !!b && a.substr(0 - b.length) === b;
}

var Item = React.createClass({
  mixins: [ReactIntlMixin],
  selectMe: function () {
    this.props.setMascote(this.props.mascote.full);
  },

  render: function () {
    
    var classes = React.addons.classSet({
      SelfiePopupMenuItem: true,
      lameHover: true,
      lastInRow: this.props.lastInRow,
      selected: this.props.selected
    });

    return <li className={classes} onClick={this.selectMe} style={{
        background: 'url(' + this.props.mascote.mobThumb + ') center no-repeat',
        backgroundSize: 'cover'
      }}>
    </li>
  }
});

var PopupMenu = React.createClass({
  mixins: [ReactIntlMixin],
  setMascote: function (src) {
    this.props.setImage('mascote', src);
  },

  render: function () {
    
    return <div id='SelfiePopUpMenuContainer' className={React.addons.classSet({visible: this.props.visible})}>
      <div className='fullWrapper'>
        { this.props.mascotes.length
            ?
              <ul id='SelfiePopupMenuList'>
                 {
                  _.map(this.props.mascotes, function (mascote, index) {
                    var isSelected = compareSrc(mascote.full, this.props.selected);
                    return <Item key={index} lastInRow={(index + 1) % 3 === 0} mascote={mascote} selected={isSelected} setMascote={this.setMascote} />;
                  }, this)
               }
             </ul>
           : null
        }
      </div>
    </div>;
  }
});

module.exports = PopupMenu;