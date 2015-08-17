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

var Promise = require('bluebird');
var mongoose = require('mongoose');
var String = mongoose.Schema.Types.String;
var Number = mongoose.Schema.Types.Number;

// define schema and model
var articleSchema = new mongoose.Schema({
  _id: String,
  title: String,
  date: mongoose.Schema.Types.Date,
  url: String,
  text: String,
  entities: [{
    _id: false,
    text: String,
    count: Number,
    sentiment: Number
  }]
});
var Article = mongoose.model('Article', articleSchema);

// DB object with fun methods
var EntitiesDB = {
  /**
   * Initialize the database connection
   */
  init: function () {
    // step one: load the credentials from either json or env variable
    var mongoConfig;
    if (process.env.VCAP_SERVICES) {
      mongoConfig = JSON.parse(process.env.VCAP_SERVICES)['mongolab'];
    } else {
      try {
        var config = require('./config.json');
        mongoConfig = config['mongolab'];
      } catch (e) { console.error(e); }
    }
    mongoConfig = mongoConfig[0].credentials;
    mongoose.connect(mongoConfig.uri);
    // step two: connect mongoose
    return new Promise(function (resolve, reject) {
      db = mongoose.connection;
      db.on('error', reject);
      db.once('open', resolve);
    });
  },

  /**
   * Given an array of documents from alchemy, convert them into Articles
   * as defined in the Schema, and upload them to our database. If an article
   * with the same id exists, we update the value of what's already there.
   */
  uploadArticlesFromDocs: function (docs) {
    // ideally we could do some kind of batch operation like
    // Article.create(docs.map(this._adaptFromAlchemyDoc), function (args) {});
    // but I don't believe there's a way to do that with the upsert scheme.
    // so... until we figure that out, we'll live this method as one request per document
    docs.forEach(function (doc) {
      var articlePrimitive = this._adaptFromAlchemyDoc(doc);
      Article.findByIdAndUpdate(doc.id, articlePrimitive, {upsert: true}, function (args) {
        var mattdamon;
      });
    }.bind(this));
  },

  /**
   * Given a response from Alchemy, create a new Article that
   * aligns with our schema
   */
  _adaptFromAlchemyDoc: function (doc) {
    var enrichedUrl = doc.source.enriched.url;
    return {
      _id: doc.id,
      title: enrichedUrl.title,
      date: new Date(doc.timestamp * 1000),
      url: enrichedUrl.url,
      entities: enrichedUrl.entities.map(function (e) {
        return {
          text: e.text,
          count: e.count,
          sentiment: e.sentiment.score
        }
      })
    };
  }
}

module.exports = EntitiesDB;