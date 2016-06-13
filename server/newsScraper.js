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

const Promise = require('bluebird');
const fs = require('fs');
const AlchemyAPI = require('alchemyapi_node');
const path = require('path');
const appEnv = require('./appEnv');
let alchemy;

/**
 * If we have an apiKey, write it to api_key.txt and instantiate a new AlchemyAPI
 */
const apiKey = appEnv.getService(/AlchemyAPI/ig).credentials.apikey;
if (apiKey) {
  fs.writeFileSync(path.resolve(__dirname, '../node_modules/alchemyapi_node/api_key.txt'), apiKey);
  console.log(`AlchemyAPI key: ${apiKey} successfully written to api_key.txt`);
  console.log('You are now ready to start using AlchemyAPI.');
  alchemy = new AlchemyAPI();
} else {
  console.error('no Alchemy API key was provided.');
}

const returnInfo = [
  'enriched.url.title',
  'enriched.url.url',
  'enriched.url.entities.entity.sentiment.score',
  'enriched.url.entities.entity.count',
  'enriched.url.entities.entity.text'
];

/**
 * Our news scraper.
 * Currently only has one method - `getEntities` which handles querying AlchemyAPI.
 * The query is focused around election articles with a confidence >= 0.75. We resolve
 * with entity sentiment, count, and text as well as the articles title and URL.
 */
const newsScraper = (start, end) =>
  new Promise((resolve, reject) => {
    if (!alchemy) reject(new error('Alchemy was never initialized'));
    start = start || 'now-1d';
    end = end || 'now';
    alchemy.news({
      start: start,
      end: end,
      maxResults: 1000,
      'q.enriched.url.enrichedTitle.taxonomy.taxonomy_': '|label=elections,score=>0.75|',
      return: returnInfo.join(',')
    }, response => {
      if (response.status === 'ERROR') {
        console.log('Alchemy reponse failed:');
        console.error(response);
        reject(response);
      } else {
        const length = response.result.docs ? response.result.docs.length : 0
        console.log(`loaded ${length} articles from AlchemyAPI`);
        resolve(response.result.docs);
      }
    });
  });

module.exports = newsScraper;
