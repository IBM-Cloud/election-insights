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
var entitiesDB = require('./entitiesDB');

/* GET home page. */
router.get('/', function (req, res) {
  res.render('index');
});

/**
 * Load news articles and flatten them in to name/value pairs for either entities, concepts, or keywords.
 */
router.get('/newsinsights', function (req, res) {
  var start = req.query.start && parseInt(req.query.start);
  var end = req.query.end && parseInt(req.query.end);
  var limit = req.query.limit && parseInt(req.query.limit);
  entitiesDB.aggregateEntities(start, end, limit).then(function (results) {
    res.json(results);
  }).catch(function (e) {
    res.json(e);
  });
});

/** Load the min and max date range */
router.get('/minandmax', function (req, res) {
  entitiesDB.getMinAndMaxDates().then(function (minAndMax) {
    res.json(minAndMax)
  }).catch(function (e) {
    res.json(e);
  })
});

module.exports = router;
