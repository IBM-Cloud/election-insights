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
var _ = require('lodash');

var _insights = [];
var _start = 0;
var _end = 0;
var _min = 0;
var _max = 0;
var _numBubbles = 100;
var _selectedEntity;
var _articles = [];

function setInsights (newInsights) {
  _insights = newInsights;
}

function selectEntity (entity) {
  if (_selectedEntity) {
    _selectedEntity.selected = false;
    _selectedEntity = undefined;
    _articles = [];
  }
  if (entity) {
    _selectedEntity = _.find(_insights, { _id: entity });
    _selectedEntity.selected = true;
  }
}

function setArticles (articles) {
  _articles = articles;
}

function setStart(newStart) {
  _start = newStart;
}

function setEnd(newEnd) {
  _end = newEnd;
}

function setMin(newMin) {
  _min = newMin;
}

function setMax(newMax) {
  _max = newMax;
}

function setNumBubbles (newBubbles) {
  _numBubbles = newBubbles;
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
  },

  getMin: function () {
    return _min;
  },

  getMax: function () {
    return _max;
  },

  getNumBubbles: function () {
    return _numBubbles;
  },

  getSelectedEntity: function () {
    return _selectedEntity;
  },

  getArticles: function () {
    return _articles;
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
      setNumBubbles(action.numBubbles);
      InsightStore.emitChange();
      break;

    case Constants.MIN_AND_MAX:
      setMin(action.min);
      setMax(action.max);
      InsightStore.emitChange();
      break;

    case Constants.ENTITY_SELECTED:
      var alreadySelected = !!_selectedEntity;
      selectEntity(action.entity);
      // only emit a change... if things have changed
      if (alreadySelected || action.entity) {
        InsightStore.emitChange();
      }
      break;

    case Constants.ARTICLES_LOADED:
      setArticles(action.articles);
      InsightStore.emitChange();
      break;

    default:
      // no op
  }
});

module.exports = InsightStore;
