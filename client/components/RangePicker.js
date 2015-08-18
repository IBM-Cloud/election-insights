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

import React         from 'react';
import Actions       from '../Actions';
import Constants     from '../constants/Constants';
import DateTimeField from 'react-bootstrap-datetimepicker';

class NewsInsights extends React.Component {
  render () {
    return (
      <div className='range-picker'>
        <div className='start-picker'>
          Start
          <DateTimeField dateTime={'' + this.props.start} onChange={this.onStartChange.bind(this)} />
        </div>
        <div className='end-picker'>
          End
          <DateTimeField dateTime={'' + this.props.end} onChange={this.onEndChange.bind(this)} />
        </div>
      </div>
    );
  }

  onStartChange (x) {
    Actions.getInsights(x, this.props.end, 100);
  }

  onEndChange (x) {
    Actions.getInsights(this.props.start, x, 100);
  }
}

module.exports = NewsInsights;
