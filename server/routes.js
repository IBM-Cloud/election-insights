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
var router = express.Router();
var alchemy = require('./alchemy');
var _ = require('lodash');
var fs = require('fs');
var fakeResponse = JSON.parse(fs.readFileSync(__dirname + '/fakeResponse.json'));

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});

/**
 * Load news articles and flatten them in to name/value pairs for either entities, concepts, or keywords.
 * Query params are:
 *   start
 *   end
 *   type - one of 'entities', or 'keywords'. defaults to 'entities' if not sepcified
 *   grouping - if type is 'entities' can specify to group by 'type' or 'text'
 */
router.get('/newsinsights', function (req, res) {
  var start = req.query.start || 'now-1d';
  var end = req.query.end || 'now';
  var type = req.query.type || 'entities';
  var grouping = type === 'entities' ? (req.query.grouping || 'text') : 'text';

  // alchemy.news({
  //   start: start,
  //   end: end,
  //   maxResults: 1000,
  //   return: getReturnInfoArray(type).join(',')
  // }, function (response) {
  //   if (response.status === 'ERROR') {
  //     res.status(400);
  //     res.json(response);
  //   } else {
  //     res.json(collapseResponse(response));
  //   }
  // });
  
  res.json(collapseResponse(fakeResponse, type, grouping));
});

/**
 * Convert a response of that looks like {result: {docs: [ {source: {enriched: {url: {type: {text: ...
 * to an array of names and values. The values represent how many times that entity/concept/keyword
 * is represented in the response.
 */
function collapseResponse (response, type, grouping) {
  // first build a map of {name: {value: number, sentiment: Array.<number>}}
  var map = {};
  var arr = _(response.result.docs)
    .map(function (d) {return d.source.enriched.url[type]})
    .flatten()
    .forEach(function (d) {
      var newAmount = type === 'entities' ? d.count : 1;
      if (map[d[grouping]]) {
        map[d[grouping]].value += newAmount;
        map[d[grouping]].sentiment.push(d.sentiment.score);
      } else {
        map[d[grouping]] = {
          value: newAmount,
          sentiment: [d.sentiment.score]
        };
      }
    })
    .value();
  // convert the map into an array of {name: name, value: value} objects
  var newResponse = [];
  var awesome = _.forOwn(map, function (obj, key) {
    newResponse.push({
      name: key,
      value: obj.value,
      sentiment: (_.reduce(obj.sentiment, function (total, n) {
        return total + n;
      }) / obj.sentiment.length)
    });
  });
  // only return the top 100 sorted by value
  return newResponse.sort(function (a, b) {
    if (a.value > b.value) {
      return -1;
    } else if (a.value < b.value) {
      return 1;
    } else {
      return 0;
    }
  }).slice(0, Math.min(100, newResponse.length));
}

/**
 * Return an array of strings to request from AlchemyAPI
 */
function getReturnInfoArray (type) {
  var baseReturnInfo = [
    // 'enriched.url.title',
    // 'enriched.url.docSentiment.type',
    // 'enriched.url.docSentiment.score',
    // 'enriched.url.docSentiment.mixed'
  ];
  var returnInfo;
  switch (type) {
    case 'entities':
      returnInfo = baseReturnInfo.concat(
        'enriched.url.entities.entity.text',
        'enriched.url.entities.entity.type',
        'enriched.url.entities.entity.sentiment',
        'enriched.url.entities.entity.count'
      );
      break;

    case 'keywords':
      returnInfo = baseReturnInfo.concat(
        'enriched.url.keywords.keyword.text',
        'enriched.url.keywords.keyword.sentiment'
      );
      break;

    default:
      // no op
  }
  return returnInfo;
}

module.exports = router;
