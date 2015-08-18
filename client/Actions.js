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
    start = start || getTodayTime();
    end = end || getTomorrowTime();
    Dispatcher.dispatch({ actionType: Constants.LOAD_INSIGHTS, start: start, end: end });
    requester.fetchInsights(start, end, limit).then(insights => {
      Dispatcher.dispatch({ actionType: Constants.INSIGHTS_LOADED, insights: insights });
    });
  }
}

/* Helper methods for date string formatting */
function getToday () {
  return new Date((new Date()).toDateString());
}
function getTodayTime () {
  return getToday().getTime();
}
function getTomorrow () {
  var today = getToday();
  return new Date(today.getUTCFullYear(), today.getMonth(), today.getDate() + 1);
}
function getTomorrowTime () {
  return getTomorrow().getTime();
}

module.exports = Actions;
