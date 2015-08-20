//------------------------------------------------------------------------------
// Copyright IBM Corp. 2015
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//------------------------------------------------------------------------------

import React      from 'react';
import classnames from 'classnames';
import Actions    from '../Actions';
import Constants  from '../constants/Constants';

class NewsInsights extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      pos: {x: 0, w: 0},
      dragging: false,
      dragEntry: ''
    };
    this.onHandleLeftMouseDown  = this._onMouseDown.bind(this, 'leftHandle');
    this.onHandleRightMouseDown = this._onMouseDown.bind(this, 'rightHandle');
    this.onSliderMouseDown      = this._onMouseDown.bind(this, 'slider');
    this.onMouseMove = this._onMouseMove.bind(this);
    this.onMouseUp = this._onMouseUp.bind(this);
  }

  componentWillReceiveProps (props) {
    var myNode = React.findDOMNode(this);
    var x = (props.start - props.min) / (props.max - props.min) * myNode.clientWidth;
    var e = (props.end   - props.min) / (props.max - props.min) * myNode.clientWidth;

    this.setState({pos: {x: x, w: e - x }});
  }

  _onMouseDown (dragEntry, e) {
    this._curX = e.clientX;
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    this.setState({dragging: true, dragEntry: dragEntry});
  }

  _onMouseMove (e) {
    var clientX = e.clientX;
    var dx = clientX - this._curX;
    this._curX = clientX;

    var newX = this.state.pos.x;
    var newW = this.state.pos.w;

    switch (this.state.dragEntry) {
      case 'leftHandle':
        newX += dx;
        newW -= dx
        break;

      case 'rightHandle':
        newW += dx;
        break;

      case 'slider':
        newX += dx;
        break;
    }

    this.setState({ pos: { x: newX, w: newW}});
  }

  _onMouseUp (e) {
    this.setState({dragging: false});

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    var myNode = React.findDOMNode(this);
    var start = this.state.pos.x / myNode.clientWidth * (this.props.max - this.props.min) + this.props.min;
    var end   = (this.state.pos.x + this.state.pos.w) / myNode.clientWidth * (this.props.max - this.props.min) + this.props.min;
    Actions.getInsights(start, end, 100);
  }

  render () {
    var rangeClasses = classnames('range-picker', {dragging: this.state.dragging});
    return (
      <div className="range-picker-container">
        <div className={rangeClasses}>
          <div className="range-background"></div>
          <div className="range-slider"
            onMouseDown={this.onSliderMouseDown}
            style={{
              left: this.state.pos.x,
              width: this.state.pos.w
            }} />
          <div className="handle left"
            onMouseDown={this.onHandleLeftMouseDown}
            style={{
              left: this.state.pos.x
            }} />
          <div className="handle right"
            onMouseDown={this.onHandleRightMouseDown}
            style={{
              left: this.state.pos.x + this.state.pos.w
            }} />
        </div>
      </div>
    );
  }
}

module.exports = NewsInsights;
