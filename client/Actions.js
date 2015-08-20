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

import Dispatcher from './Dispatcher';
import Constants  from './constants/Constants';
import requester  from './requester';

var Actions = {
  getInsights: function (start, end, limit) {
    Dispatcher.dispatch({ actionType: Constants.LOAD_INSIGHTS, start: start, end: end });
    requester.fetchInsights(start, end, limit).then(insights => {
      Dispatcher.dispatch({ actionType: Constants.INSIGHTS_LOADED, insights: insights });
    });
  },

  getMinAndMax: function () {
    requester.fetchMinAndMax().then(minAndMax => {
      Dispatcher.dispatch({ actionType: Constants.MIN_AND_MAX, min: minAndMax.min, max: minAndMax.max });
    });
  },

  initialize: function () {
    requester.fetchMinAndMax().then(minAndMax => {
      Dispatcher.dispatch({ actionType: Constants.MIN_AND_MAX, min: minAndMax.min, max: minAndMax.max });
      this.getInsights(minAndMax.min, minAndMax.max);
    });
  }
}

module.exports = Actions;
