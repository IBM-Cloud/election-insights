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
import ReactDOM from 'react-dom';
import moment from 'moment';
import classnames from 'classnames';
import Actions    from '../Actions';
import Constants  from '../constants/Constants';

class NewsInsights extends React.Component {
  constructor (props) {
    super(props);
    // initial state
    this.state = {
      pos: {x: 0, w: 0},
      dragging: false,
      dragEntry: ''
    };
    // we need to do this because we need a reference to the bound function
    // so that we can remove the event listener for it
    this.onHandleLeftMouseDown  = this._onMouseDown.bind(this, 'leftHandle');
    this.onHandleRightMouseDown = this._onMouseDown.bind(this, 'rightHandle');
    this.onSliderMouseDown      = this._onMouseDown.bind(this, 'slider');
    this.onMouseMove = this._onMouseMove.bind(this);
    this.onMouseUp = this._onMouseUp.bind(this);
  }

  /** When the props are updating, set our x and w based on the start and end */
  componentWillReceiveProps (props) {
    var x = this._timeToPos(props.start, {min: props.min, max: props.max});
    var e = this._timeToPos(props.end,   {min: props.min, max: props.max});
    this.setState({pos: {x: x, w: e - x }});
  }

  /** Configure the state and event handlers for proper mouse dragginess */
  _onMouseDown (dragEntry, e) {
    var isTouch = !!e.touches;
    this._curX = isTouch ? e.touches[0].clientX : e.clientX;
    if (isTouch) {
      document.addEventListener('touchmove', this.onMouseMove);
      document.addEventListener('touchend', this.onMouseUp);
    } else {
      document.addEventListener('mousemove', this.onMouseMove);
      document.addEventListener('mouseup', this.onMouseUp);
    }
    this.setState({dragging: true, dragEntry: dragEntry});
  }

  /** When the mouse moves, adjust x and w depending on what is being dragged */
  _onMouseMove (e) {
    var clientX = e.touches ? e.touches[0].clientX : e.clientX;
    var dx = clientX - this._curX;
    this._curX = clientX;
    var rangeDom = ReactDOM.findDOMNode(this.refs.rangePicker);

    var newX = this.state.pos.x;
    var newW = this.state.pos.w;
    switch (this.state.dragEntry) {
      case 'leftHandle':
        var hasWidth = newW - dx > 10;
        var inLeftBoundary = newX + dx > 0;
        if (hasWidth && inLeftBoundary) {
          newX += dx;
          newW -= dx
        }
        break;

      case 'rightHandle':
        var hasWidth = newW + dx > 10;
        var inRightBoundary = newX + newW + dx < rangeDom.clientWidth
        if (hasWidth && inRightBoundary) {
          newW += dx;
        }
        break;

      case 'slider':
        var inLeftBoundary = newX + dx > 0;
        var inRightBoundary = newW + newX + dx < rangeDom.clientWidth;
        if (inLeftBoundary && inRightBoundary) {
          newX += dx;
        }
        break;
    }
    this.setState({ pos: { x: newX, w: newW}});
  }

  /** On mouse up envoke the Action to re-load the circles */
  _onMouseUp (e) {
    this.setState({dragging: false});

    document.removeEventListener('mousemove', this.onMouseMove);
    document.removeEventListener('mouseup', this.onMouseUp);

    var start = this._posToTime(this.state.pos.x);
    var end = this._posToTime(this.state.pos.x + this.state.pos.w);
    Actions.getInsights(start, end);
  }

  /** Convert a time in ms to an x position relative to the beginning of the
    * slider. Can optionally provide a min and max object. defaults to using props. */
  _timeToPos (time, minAndMax) {
    var node = ReactDOM.findDOMNode(this.refs.rangePicker);
    var min = minAndMax ? minAndMax.min : this.props.min;
    var max = minAndMax ? minAndMax.max : this.props.max;
    return (time - min) / (max - min) * node.clientWidth;
  }

  /** Convert an x position relative to the beginning of the slider to a time in ms */
  _posToTime (pos) {
    var node = this.refs.rangePicker && ReactDOM.findDOMNode(this.refs.rangePicker);;
    return node ? pos / node.clientWidth * (this.props.max - this.props.min) + this.props.min : 0;
  }

  render () {
    var rangeClasses = classnames('range-picker', {dragging: this.state.dragging});
    var start = this._posToTime(this.state.pos.x);
    var end = this._posToTime(this.state.pos.x + this.state.pos.w);
    return (
      <div className="range-picker-container">
        <span className="label min">{moment(this.props.min).format('MMM DD, h:mma')}</span>
        <div className={rangeClasses} ref="rangePicker">
          <div className="range-background"></div>
          <div className="range-slider"
            onMouseDown={this.onSliderMouseDown}
            onTouchStart={this.onSliderMouseDown}
            style={{
              left: this.state.pos.x,
              width: this.state.pos.w
            }}>{moment.duration(start - end).humanize()}</div>
          <div className="handle left"
            onMouseDown={this.onHandleLeftMouseDown}
            onTouchStart={this.onHandleLeftMouseDown}
            style={{
              left: this.state.pos.x - 22
            }}>
            <div className="displayed-handle"></div>
          </div>
          <div className="value-container start" style={{left: this.state.pos.x}}>
            <div className="value start">{moment(start).format('MMM DD, h:mma')}</div>
          </div>
          <div className="handle right"
            onMouseDown={this.onHandleRightMouseDown}
            onTouchStart={this.onHandleRightMouseDown}
            style={{
              left: this.state.pos.x + this.state.pos.w - 22
            }}>
            <div className="displayed-handle"></div>
          </div>
          <div className="value-container end" style={{left: this.state.pos.x + this.state.pos.w}}>
            <div className="value end">{moment(end).format('MMM DD, h:mma')}</div>
          </div>
        </div>
        <span className="label max">{moment(this.props.max).format('MMM DD, h:mma')}</span>
      </div>
    );
  }
}

module.exports = NewsInsights;
