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

import d3      from 'd3';
import Actions from '../Actions';

var BubbleChartD3 = {};
var format = d3.format(',');
// define a color scale for our sentiment analysis
var color = d3.scale.quantize()
  .domain([-1, 1])
  // .range(["#67000d", "#08306b"]);
  .range([
    // reds from dark to light
    "#67000d", "#a50f15", "#cb181d", "#ef3b2c", "#fb6a4a", "#fc9272", "#fcbba1", "#fee0d2",
    //neutral grey
    "#f0f0f0",
    // blues from light to dark
    "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"
  ]);

/**
 * Prepare D3 town for proper operation
 * @param  {DOM}    el    The Dom Node container that's going to house this bubble chart
 * @param  {Object} state An object containing the data
 */
BubbleChartD3.create = function (el, state) {
  var svg = d3.select(el).append('svg')
    .attr('class', 'bubble-chart-d3');

  svg.append('g')
    .attr('class', 'news-bubbles');

  this.update(el, state);
}

/**
 * Do the actual bubble drawing
 * @param  {DOM}    el    The Dom Node container that's going to house this bubble chart
 * @param  {Object} state An object containing the data
 */
BubbleChartD3.update = function (el, state) {
  var data = state.data;
  // reference to our <g> container
  var g = d3.select(el).selectAll('.news-bubbles');
  // remove all existing bubbles
  g.selectAll('.bubble-container').remove();
  // create our bubble layout
  var bubble = d3.layout.pack()
    .sort(null)
    .size([el.offsetWidth, el.offsetHeight])
    .padding(1.5);
  // calculate the size and positioning of each bubble
  var node = g.selectAll('.news-bubble')
    .data(bubble.nodes({children: data})
      .filter(d => !d.children && d.r)
    );
  // create our bubble containers
  node.enter()
    .append('g')
    .attr('class', 'bubble-container')
    .attr('transform', d => ('translate(' + d.x + ',' + d.y + ')'));
  // add a title to each bubble
  node.append('title')
    .text(d => d._id + ': ' + format(d.value));
  // create the actual circle
  node.append('circle')
    .attr('r', d => d.r )
    .style('fill', d => color(d.sentiment));
  // if you like it then you should've put a label on it
  node.append('text')
    .attr('dy', '.3em')
    .style('text-anchor', 'middle')
    .text(d => d._id);
  // i dont really know what this does!
  node.exit()
    .remove();
}

/**
 * Any clean up would go here for now there is nothing to do
 * @param  {[type]} el [description]
 * @return {[type]}    [description]
 */
BubbleChartD3.destroy = function (el) {}

module.exports = BubbleChartD3;
