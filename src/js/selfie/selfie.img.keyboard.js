module.exports = {
  moveTop: function (event) {
    event.preventDefault();

    var nState = {
      top: this.state.top - this.state.height * 0.1,
      left: this.state.left,
      width: this.state.width,
      height: this.state.height
    };

    if (!this.validateState(nState)) return;

    this.setState(nState, this.writeState);
  },
  moveBottom: function (event) {
    event.preventDefault();

    var nState = {
      top: this.state.top + this.state.height * 0.1,
      left: this.state.left,
      width: this.state.width,
      height: this.state.height
    };

    if (!this.validateState(nState)) return;

    this.setState(nState, this.writeState);
  },
  moveLeft: function (event) {
    event.preventDefault();

    var nState = {
      top: this.state.top,
      left: this.state.left - this.state.width * 0.1,
      width: this.state.width,
      height: this.state.height
    };

    if (!this.validateState(nState)) return;

    this.setState(nState, this.writeState);
  },
  moveRight: function (event) {
    event.preventDefault();

    var nState = {
      top: this.state.top,
      left: this.state.left + this.state.width * 0.1,
      width: this.state.width,
      height: this.state.height
    };

    if (!this.validateState(nState)) return;

    this.setState(nState, this.writeState);
  },
  zoomIn: function (event) {
    this.state.width += this.state.width * 0.1;
    this.state.height += this.state.height * 0.1;
    this.setState(this.state, this.writeState);
  },
  zoomOut: function (event) {

    var nState = {
      top: this.state.top,
      left: this.state.left,
      width: this.state.width * 0.9,
      height: this.state.height * 0.9
    };

    if (!this.validateState(nState)) return;

    this.setState(nState, this.writeState);
  }
};