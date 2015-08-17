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

var fs = require('fs');
var AlchemyAPI = require('./alchemyapi_node/alchemyapi');
var alchemyapi;

/**
 * Helper module that handles instantiating AlchemyAPI with the correct key. Exports
 * is a singleton instance of AlchemyAPI.
 */

/**
 * First we get the userProvided array.
 * If running in Bluemix this'll be found in the VCAP_SERVICES environment variable.
 * If running locally, this'll be found in config.json
 */
var userProvided;
if (process.env.VCAP_SERVICES ) {
  userProvided = JSON.parse(process.env.VCAP_SERVICES)['user-provided'];
} else {
  try {
    var config = require('./config.json');
    userProvided = config['user-provided'];
  } catch (e) { console.error(e); }
}

/**
 * Extract the apiKey out of the userProvided array.
 */
var apiKey;
if (userProvided) {
  apiKey = userProvided[0] && userProvided[0].credentials && userProvided[0].credentials.apikey;
} else {
  console.error('Need to set user-provided either in environment variables, or in config.json')
}

/**
 * If we have an apiKey, write it to api_key.txt and instantiate a new AlchemyAPI
 */
if (apiKey) {
  fs.writeFileSync(__dirname + '/alchemyapi_node/api_key.txt', apiKey);
  console.log('AlchemyAPI key: ' + apiKey + ' successfully written to api_key.txt');
  console.log('You are now ready to start using AlchemyAPI.');
  alchemyapi = new AlchemyAPI();
} else {
  console.error('no Alchemy API key was provided.');
}

module.exports = alchemyapi;
