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

import d3 from 'd3';

var BubbleChartD3 = {};
var format = d3.format(',');
var color = d3.scale.category20c();

BubbleChartD3.create = function (el, props, state) {
  var svg = d3.select(el).append('svg')
    .attr('class', 'bubble-chart-d3')
    .attr('width', props.width)
    .attr('height', props.height);

  svg.append('g')
    .attr('class', 'news-bubbles');

  this.update(el, state);
}

BubbleChartD3.update = function (el, state) {
  var data = state.data;

  var g = d3.select(el).selectAll('.news-bubbles');

  var bubble = d3.layout.pack()
    .sort(null)
    .size([el.offsetWidth, el.offsetHeight])
    .padding(1.5);

  var node = g.selectAll('.news-bubble')
    .data(bubble.nodes({children: data})
      .filter(d => !d.children && d.r)
    );

  node.enter()
    .append('g')
    .attr('class', 'bubble-container')
    .attr('transform', d => ('translate(' + d.x + ',' + d.y + ')'));

  node.append('title')
    .text(d => d.name + ': ' + format(d.value));

  node.append('circle')
    .attr('r', d => d.r )
    .style('fill', d => color(d.name));

  node.append('text')
    .attr('dy', '.3em')
    .style('text-anchor', 'middle')
    .text(d => d.name);

  node.exit()
    .remove();
}

BubbleChartD3.destroy = function (el) {
  // Any clean-up would go here
  // in this example there is nothing to do
}

module.exports = BubbleChartD3;