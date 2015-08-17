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

  getLastHour: function () {
    return new Promise(function (resolve, reject) {
      var o = {};
      o.map = function () {
        for (var i = 0; i < this.entities.length; i++) {
          var e = this.entities[i];
          emit(e.text, {count: e.count, sentiment: e.sentiment});
        }
      }
      o.reduce = function (k, vals) {
        return {
          count: vals.reduce(function (prev, c) {return c.count + prev}, 0),
          sentiment: vals.reduce(function (prev, c) {return c.sentiment + prev}, 0) / vals.length
        }
      }
      // o.limit = 5;
      Article.mapReduce(o, function (err, results) {
        if (err) {
          reject(err);
        } else {
          resolve(results.sort(function (a, b) {
            if (a.value.count > b.value.count) {
              return -1;
            } else if (a.value.count < b.value.count) {
              return 1;
            } else {
              return 0;
            }
          }).slice(0, Math.min(100, results.length)).map(function (r) {
            return {
              name: r._id,
              value: r.value.count,
              sentiment: r.value.sentiment
            }
          }));
        }
      })
    }.bind(this));
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
      if (doc) {
        var articlePrimitive = this._adaptFromAlchemyDoc(doc);
        if (articlePrimitive) {
          Article.findByIdAndUpdate(doc.id, articlePrimitive, {upsert: true}, function (args) {
            var mattdamon;
          });
        }
      }
    }.bind(this));
  },

  /**
   * Given a response from Alchemy, create a new Article that
   * aligns with our schema
   */
  _adaptFromAlchemyDoc: function (doc) {
    var enrichedUrl = doc.source && doc.source.enriched && doc.source.enriched.url;
    if (enrichedUrl) {
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
}

module.exports = EntitiesDB;