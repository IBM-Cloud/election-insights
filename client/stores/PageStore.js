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

import _Store     from './_Store';
import Dispatcher from '../Dispatcher';
import Constants  from '../constants/Constants';
import assign     from 'object-assign';

var _openTab = 'keywords';
var _subTab = '';

function setOpenTab (newTab) {
  _openTab = newTab;
}

function setSubTab (newSubTab) {
  _subTab = newSubTab;
}

var PageStore = assign({}, _Store, {
  getOpenTab: function () {
    return _openTab;
  },

  getSubTab: function () {
    return _subTab;
  }
});

Dispatcher.register(function(action) {
  switch(action.actionType) {
   case Constants.TAB_SWITCH_KEYWORDS:
      setOpenTab('keywords');
      setSubTab('');
      PageStore.emitChange();
      break;

   case Constants.TAB_SWITCH_ENTITIES:
      setOpenTab('entities');
      setSubTab(action.grouping || 'text');
      PageStore.emitChange();
      break;

    default:
      // no op
  }
});

module.exports = PageStore;
