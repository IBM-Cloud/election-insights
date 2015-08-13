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

import React          from 'react';
import Actions        from '../Actions';
import classNames     from 'classnames';

var navTabs = [{
  display: 'concepts',
  action: Actions.toggleConcepts.bind(Actions)
}, {
  display: 'keywords',
  action: Actions.toggleKeywords.bind(Actions)
}, {
  display: 'entities',
  action: Actions.toggleEntities.bind(Actions, null)
}];

var altTabs = [{
  display: 'text',
  action: Actions.toggleEntities.bind(Actions, 'text')
}, {
  display: 'type',
  action: Actions.toggleEntities.bind(Actions, 'type')
}];

class Tab extends React.Component {
  render () {
    var classes = classNames('tab', {
      open: this.props.open
    });
    return <li className={classes} onClick={this.props.action}>{this.props.display}</li>;
  }
};

class NavTabs extends React.Component {
  render () {
    var tabsToShow = this.props.openTab === 'entities' ? navTabs.concat(altTabs) : navTabs;
    var tabs = tabsToShow.map(ta =>
      <Tab display={ta.display} action={ta.action} open={this.props.openTab === ta.display || this.props.subTab === ta.display} />
    );
    return <ul className='nav-tabs'>{tabs}</ul>;
  }
};

module.exports = NavTabs;
