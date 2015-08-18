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

var _Store = require('./_Store');
var Dispatcher = require('../Dispatcher');
var Constants = require('../constants/Constants');
var assign = require('object-assign');

var _insights = [];
var _start = 0;
var _end = 0;

function setInsights (newInsights) {
  _insights = newInsights;
}

function setStart(newStart) {
  _start = newStart;
}

function setEnd(newEnd) {
  _end = newEnd;
}

var InsightStore = assign({}, _Store, {
  getInsights: function () {
    return _insights;
  },

  getStart: function () {
    return _start;
  },

  getEnd: function () {
    return _end;
  }
});

Dispatcher.register(function(action) {
  switch(action.actionType) {
    case Constants.INSIGHTS_LOADED:
      setInsights(action.insights);
      InsightStore.emitChange();
      break;

    case Constants.LOAD_INSIGHTS:
      setStart(action.start);
      setEnd(action.end);
      InsightStore.emitChange();
      break;

    default:
      // no op
  }
});

module.exports = InsightStore;
