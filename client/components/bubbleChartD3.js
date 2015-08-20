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

var colorRange = [
  // reds from dark to light
  "#67000d", "#a50f15", "#cb181d", "#ef3b2c", "#fb6a4a", "#fc9272", "#fcbba1", "#fee0d2",
  //neutral grey
  "#f0f0f0",
  // blues from light to dark
  "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"
];
var colorLegend = colorRange.slice(0).reverse().map((c, i) => {
  var ret = {color: c};
  // TODO don't hardcode these
  if (i === 0) {
    ret.text = 'Positive';
  } else if (i === 8) {
    ret.text = 'Neutral';
  } else if (i === 16) {
    ret.text='Negative';
  } 
  return ret;
});
var legendRectSize = 18;
var legendSpacing = 3;

var BubbleChartD3 = {};
var format = d3.format(',');
// define a color scale for our sentiment analysis
var color = d3.scale.quantize()
  .domain([-1, 1])
  .range(colorRange);

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

  // create a legend and center it vertically
  var legendHeight = colorLegend.length * (legendRectSize + legendSpacing) - legendSpacing;
  var legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', 'translate(80,' + (el.offsetHeight - legendHeight)/2  + ')');

  // for each color in the legend, create a g and set its transform
  var legendKeys = legend.selectAll('.legend-key')
    .data(colorLegend)
    .enter()
    .append('g')
    .attr('class', 'legend-key')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var vert = i * height;
      return 'translate(' + 0 + ',' + vert + ')';
    });

  // for each <g> create a rect and have its color... be the color
  legendKeys.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', c => c.color)
    .style('stroke', c => c.color);

  // add necessary labels to the legend
  legendKeys.append('text')
    .attr('x', legendRectSize + legendSpacing)
    .attr('y', legendRectSize - legendSpacing)
    .text(c => c.text);

  this.update(el, state);
}

/**
 * Do the actual bubble drawing
 * @param  {DOM}    el    The Dom Node container that's going to house this bubble chart
 * @param  {Object} state An object containing the data
 *   must contain an array called `data` that houses objects that look like:
 *   {
 *     _id: String,
 *     value: number,
 *     sentiment: number
 *   }
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
