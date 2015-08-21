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
var svg;
var bubble;
var diameter;

var legendRectSize = 18;
var legendSpacing = 3;

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

// define a color scale for our sentiment analysis
var color = d3.scale.quantize()
  .domain([-1, 1])
  .range(colorRange);

BubbleChartD3.create = function (el, state) {
  diameter = Math.min(el.offsetWidth, el.offsetHeight);

  svg = d3.select(el).append('svg')
    .attr('width', diameter)
    .attr('height', diameter)
    .attr('class', 'bubble-chart-d3');

  var legendHeight = colorLegend.length * (legendRectSize + legendSpacing) - legendSpacing;
  var legend = d3.select(el).append('svg')
    .attr('class', 'bubble-legend')
    .style('position', 'absolute')
    .style('height', legendHeight + 'px')
    .style('top', (el.offsetHeight - legendHeight)/2 + 'px')
    .style('left', 60 + 'px');

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

  bubble = d3.layout.pack()
    .sort(null)
    .size([diameter, diameter])
    .padding(3);
}

BubbleChartD3.update = function (el, state) {
  if (!state.data || !state.data.length) return;
  // generate data with calculated layout values
  var nodes = bubble.nodes({children: state.data})
    .filter(function(d) { return !d.children; }); // filter out the outer bubble

  // assign new data to existing DOM 
  var myGs = svg.selectAll('.bubble-container')
    .data(nodes, function(d) { return 'g' + d._id; });
  var myCircles = svg.selectAll('circle')
    .data(nodes, function(d) { return 'c' + d._id; });
  var myTexts = svg.selectAll('text')
    .data(nodes, function(d) { return 't' + d._id; });

  // enter data -> remove, so non-exist selections for upcoming data won't stay -> enter new data -> ...

  // To chain transitions, 
  // create the transition on the updating elements before the entering elements 
  // because enter.append merges entering elements into the update selection

  var duration = 500;
  var delay = 0;

  // update - this is created before enter.append. it only applies to updating nodes.
  myGs.transition()
    .duration(duration)
    .delay(function(d, i) {delay = i * 7; return delay;})
    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    .style('opacity', 1); // force to 1, so they don't get stuck below 1 at enter()
  myCircles.transition()
    .duration(duration)
    .delay(function(d, i) {delay = i * 7; return delay;})
    .style('fill', d => color(d.sentiment))
    .attr('r', function(d) { return d.r; })
    .remove();
  myTexts.transition()
    .remove();

  // enter - only applies to incoming elements (once emptying data)
  myGs.enter().append('g')
    .attr('class', 'bubble-container')
    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    .on('click', Actions.loadArticlesForEntity)
    .transition()
    .duration(duration * 1.2)
    .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; })
    .style('opacity', 1);   
  myGs.append('circle')
    .style('fill', d => color(d.sentiment))
    .attr('r', function(d) { return 0; })
    .transition()
    .duration(duration * 1.2)
    .attr('r', function(d) { return d.r; });
  myGs.append('text')
    .text(d => d._id)
    .attr('dy', '0.3em')
    .style('text-anchor', 'middle');

  // exit
  myGs.exit()
    .transition()
    .duration(duration)
    .attr('transform', function(d) { 
      var dy = d.y - diameter/2;
      var dx = d.x - diameter/2;
      var theta = Math.atan2(dy,dx);
      var destX = diameter * (1 + Math.cos(theta) )/ 2;
      var destY = diameter * (1 + Math.sin(theta) )/ 2; 
      return 'translate(' + destX + ',' + destY + ')'; })
    .remove();
  myCircles.exit()
    .transition()
    .duration(duration)
    .attr('r', function(d) { return 0; })
    .remove();
  myTexts.exit()
    .remove();
}

BubbleChartD3.destroy = function (el) {}

module.exports = BubbleChartD3;
