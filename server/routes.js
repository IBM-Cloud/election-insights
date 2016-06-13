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

const express = require('express');
const router = express.Router();
const entitiesDB = require('./entitiesDB');
const path = require('path');
const moment = require('moment');

/* GET home page. */
router.get('/', (req, res) => res.render('index'));

/* Get terms of service */
router.get('/tos', (req, res) => res.sendFile(path.resolve(__dirname, '../public/tos.html')));

/**
 * Load news articles and flatten them in to name/value pairs for either entities, concepts, or keywords.
 */
router.get('/newsinsights', (req, res) => {
  const { start = 0, end = 9999999999999, limit = 100 } = req.query;
  entitiesDB.aggregateEntities(parseInt(start), parseInt(end), parseInt(limit)).then(results => {
    res.json(results.map(r => {
      const capitalizedID = r._id.replace(/\w*/g, txt =>
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      );
      return {
        _id: capitalizedID,
        sentiment: r.sentiment,
        value: r.value
      }
    }));
  }).catch(e =>
    res.json(e)
  );
});

/** Load the min and max date range */
router.get('/minandmax', (req, res) => {
  entitiesDB.getMinAndMaxDates().then(minAndMax => {
    // limit min to being at most one week before the max
    minAndMax.min = Math.max(minAndMax.min, moment(minAndMax.max).subtract(1, 'week').unix() * 1000);
    res.json(minAndMax);
  }).catch(e =>
    res.json(e)
  );
});

/** Load article data for a given entity */
router.get('/articles', (req, res) => {
  const { entity, start = 0, end = 9999999999999} = req.query;
  entitiesDB.getArticlesForEntity(entity, parseInt(start), parseInt(end)).then(articles =>
    res.json(articles)
  ).catch(e =>
    res.json(e)
  );
});

module.exports = router;
