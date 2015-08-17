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

var express = require('express');
var alchemy = require('./alchemy');
var _ = require('lodash');
var entitiesDB = require('./entitiesDB');

var returnInfo = [
  'enriched.url.title',
  'enriched.url.url',
  'enriched.url.text',
  'enriched.url.entities.entity.sentiment.score',
  'enriched.url.entities.entity.count',
  'enriched.url.entities.entity.text'
];


var newsScraper = {
  getEntities: function () {
    var start = 'now-1h';
    var end = 'now';

    alchemy.news({
      start: start,
      end: end,
      maxResults: 100,
      return: returnInfo.join(',')
    }, function (response) {
      if (response.status === 'ERROR') {
        console.log('Alchemy reponse failed: ');
        console.error(response);
      } else {
        console.log('loaded ' + response.result.docs.length + ' articles from AlchemyAPI');
        entitiesDB.uploadArticlesFromDocs(response.result.docs);
      }
    }.bind(this));
  }
}

module.exports = newsScraper;
