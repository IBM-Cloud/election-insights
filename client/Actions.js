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

import moment     from 'moment';
import Dispatcher from './Dispatcher';
import Constants  from './constants/Constants';
import requester  from './requester';

var _lastStart;
var _lastEnd;
var _lastLimit = 100;
var _timeoutHandle;

var Actions = {
  getInsights: function (start, end, limit) {
    // if unspecified use previous values
    start = start || _lastStart;
    end = end || _lastEnd;
    limit = limit || _lastLimit;
    // store away current values to be referenced later
    _lastStart = start;
    _lastEnd = end;
    _lastLimit = limit;
    // dispatch and request
    Dispatcher.dispatch({ actionType: Constants.LOAD_INSIGHTS, start: start, end: end, numBubbles: limit });
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
    this.neutralPageView();
    requester.fetchMinAndMax().then(minAndMax => {
      Dispatcher.dispatch({ actionType: Constants.MIN_AND_MAX, min: minAndMax.min, max: minAndMax.max });
      this.getInsights(moment(minAndMax.max).subtract(1, 'day').unix()*1000, minAndMax.max);
    });
  },

  changeNumBubbles: function (newBubbles) {
    Dispatcher.dispatch({ actionType: Constants.LOAD_INSIGHTS, start: _lastStart, end: _lastEnd, numBubbles: newBubbles });
    // debounce triggering the network request
    _timeoutHandle && clearTimeout(_timeoutHandle);
    _timeoutHandle = setTimeout(function () {
      this.getInsights(null, null, newBubbles);
      _timeoutHandle = undefined;
    }.bind(this), 150);
  },

  loadArticlesForEntity: function (entity) {
    entity = typeof entity === 'string' ? entity : entity._id;
    this.entityPageView(entity);
    Dispatcher.dispatch({ actionType: Constants.ENTITY_SELECTED, entity: entity});
    requester.fetchArticlesForEntity(entity, _lastStart, _lastEnd).then(articles => {
      Dispatcher.dispatch({ actionType: Constants.ARTICLES_LOADED, articles: articles, entity: entity });
    })
  },

  deselectEntity: function () {
    this.neutralPageView();
    Dispatcher.dispatch({ actionType: Constants.ENTITY_SELECTED});
  },

  neutralPageView: function () {
    window.location.assign("/#/");
    if (!!ga) {
      ga('send', 'pageview');
    }
  },

  entityPageView: function (entity) {
    window.location.assign("/#/entity/" + entity);
    if (!!ga) {
      ga('send', 'pageview', '/entity/' + entity);
    }
  }
}

module.exports = Actions;
