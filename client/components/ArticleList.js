//------------------------------------------------------------------------------
// Copyright IBM Corp. 2016
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
import classnames from 'classnames';
import Actions    from '../Actions';
import Article from './Article';

export default ({ articles, selectedEntity }) =>
  <div className={classnames('article-list', { 'has-entity': !!selectedEntity })} onClick={e => e.stopPropagation()}>
    <button className="back" onClick={() => Actions.deselectEntity()}>x</button>
    <h2>{selectedEntity && (selectedEntity._id || selectedEntity)}</h2>
    <ul className="the-articles">{articles.map(a =>
      <Article article={a} />
    )}</ul>
  </div>
