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

import React            from 'react';
import ReactBubbleChart from 'react-bubble-chart';
import Actions          from '../Actions';

const colorLegend = [
  // reds from dark to light
  {color: "#67000d", textColor: '#fee0d2', text: 'Negative'},
  {color: "#a50f15", textColor: '#fee0d2'},
  {color: "#cb181d", textColor: '#fee0d2'},
  "#ef3b2c",
  "#fb6a4a",
  "#fc9272",
  "#fcbba1",
  "#fee0d2",
  //neutral grey
  {color: "#f0f0f0", text: 'Neutral'},
  // blues from light to dark
  "#deebf7",
  "#c6dbef",
  "#9ecae1",
  "#6baed6",
  "#4292c6",
  {color: "#2171b5", textColor: '#deebf7'},
  {color: '#08519c', textColor: '#deebf7'},
  {color: "#08306b", textColor: '#deebf7', text: 'Positive'}
];

export default ({ data }) =>
  <ReactBubbleChart
    colorLegend={colorLegend}
    legend={true}
    selectedColor="#737373"
    selectedTextColor="#d9d9d9"
    fixedDomain={{min: -1, max: 1}}
    onClick={Actions.loadArticlesForEntity.bind(Actions)}
    data={data.map(d => ({
      _id: d._id,
      value: d.value,
      colorValue: d.sentiment,
      selected: d.selected
    }))}
  />
