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

import bubbleChartD3 from './bubbleChartD3';
import React         from 'react';

class BubbleChart extends React.Component {
  render () {
    return <div className='bubble-chart-container'></div>;
  }

  componentDidMount () {
    bubbleChartD3.create(this.getDOMNode(), {
      width: '100%',
      height: '100%'
    }, this.getChartState());
  }

  componentDidUpdate () {
    bubbleChartD3.update(this.getDOMNode(), this.getChartState());
  }

  getChartState () {
    return {
      data: this.props.data
    }
  }

  componentWillUnmount () {
    bubbleChartD3.destroy(this.getDOMNode());
  }

  getDOMNode () {
    return React.findDOMNode(this);
  }
}

module.exports = BubbleChart;
