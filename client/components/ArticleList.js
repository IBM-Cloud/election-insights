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

import React      from 'react';
import classnames from 'classnames';
import moment     from 'moment';
import Actions    from '../Actions';

class Article extends React.Component {
  render () {
    var a = this.props.article;
    return (
      <div className="article">
        <a className="title-link" href={a.url} target="_blank">{a.title}</a>
        <div className="article-date">{moment(a.date).format('MMMM DD YYYY')}</div>
      </div>
    );
  }
}

class ArticleList extends React.Component {
  render () {
    var articles = this.props.articles.map(a => <Article article={a} />);
    var classes = classnames('article-list', {
      'has-entity': !!this.props.selectedEntity
    });
    return (
      <div className={classes} onClick={e => e.stopPropagation()}>
        <button className="back" onClick={Actions.deselectEntity.bind(Actions)}>x</button>
        <h2>{this.props.selectedEntity && (this.props.selectedEntity._id || this.props.selectedEntity)}</h2>
        <ul className="the-articles">
          {articles}
        </ul>
      </div>
    );
  }
}

module.exports = ArticleList;
