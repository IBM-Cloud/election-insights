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
import Actions       from './Actions';
import Constants     from './constants/Constants';
import BubbleChart   from './components/BubbleChart';
import RangePicker   from './components/RangePicker';
import BubbleSlider  from './components/BubbleSlider';
import ArticleList   from './components/ArticleList';
import Header        from './components/Header';
import InsightsStore from './stores/InsightsStore';

class NewsInsights extends React.Component {
  constructor (props) {
    super(props);
    this.state = this._getStateObj();
    this._onChange = e => this.setState(this._getStateObj());
  }

  render () {
    return (
      <div className="news-insights" onClick={Actions.deselectEntity}>
        <Header />
        <RangePicker
          min={this.state.min}
          max={this.state.max}
          start={this.state.start}
          end={this.state.end} />
        <BubbleChart data={this.state.insights} />
        <ArticleList articles={this.state.articles} selectedEntity={this.state.selectedEntity} />
        <BubbleSlider numBubbles={this.state.numBubbles} />
      </div>
    );
  }

   /** When first in the page, set up change handlers */
  componentDidMount () {
    InsightsStore.addChangeListener(this._onChange);
    Actions.initialize();
  }

  /** When removing, clean up change handlers */
  componentWillUnmount () {
    InsightsStore.removeChangeListener(this._onChange);
  }

  _getStateObj () {
    return {
      insights: InsightsStore.getInsights(),
      start: InsightsStore.getStart(),
      end: InsightsStore.getEnd(),
      min: InsightsStore.getMin(),
      max: InsightsStore.getMax(),
      numBubbles: InsightsStore.getNumBubbles(),
      selectedEntity: InsightsStore.getSelectedEntity(),
      articles: InsightsStore.getArticles()
    }
  }
};

React.render(<NewsInsights />, document.body);
