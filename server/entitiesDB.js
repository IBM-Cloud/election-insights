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
const mongoose = require('mongoose');
const String = mongoose.Schema.Types.String;
const Number = mongoose.Schema.Types.Number;
const moment = require('moment');
const appEnv = require('./appEnv');

// define schemas and models for articles
const articleSchema = new mongoose.Schema({
  _id: String,
  title: String,
  date: mongoose.Schema.Types.Date,
  url: String
});
const Article = mongoose.model('Article', articleSchema);

// define schemas and models for entities
const entitySchema = new mongoose.Schema({
  _id: String,
  text: String,
  count: Number,
  sentiment: Number,
  date: Date,
  article_id: String
});
const Entity = mongoose.model('Entity', entitySchema);

// DB object with fun methods
const EntitiesDB = {
  /**
   * Initialize the database connection
   */
  init: function () {
    // step one: initialize mongoose
    const mongoURI = appEnv.getService(/mongolab/ig).credentials.uri;
    mongoose.connect(mongoURI);
    // step two: connect mongoose
    return new Promise((resolve, reject) => {
      const db = mongoose.connection;
      db.on('error', reject);
      db.once('open', resolve);
    });
  },

  /**
   * Resolves with an array of entities grouped by their text. Can
   * specify a timeframe for the grouping, and can also specify the
   * number of entities to return.
   */
  aggregateEntities: function (start = 0, end = 9999999999999, limit = 100) {
    return new Promise((resolve, reject) => {
      Entity.aggregate(
        { $match: { date: { $gte: new Date(start) , $lt: new Date(end) } } },
        { $group: { _id: {'$toLower' : '$text'}, value: { $sum: '$count'}, sentiment: { $avg: '$sentiment'} } },
        { $sort: { value: -1} },
        { $limit: limit },
        (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(res);
          }
        }
      );
    });
  },

  /**
   * Given an entities text and a timeframe, resolve with the articles
   * that mention that entity.
   */
  getArticlesForEntity: function (entity, start, end) {
    return this.getArticleIdsForEntity(entity, start, end).then(articleIds => {
      return new Promise((resolve, reject) => {
        Article.find(
          { '_id': { $in: articleIds} }, // get all articles by id
          null,                          // return all columns
          { sort: {date: -1}},           // sort by date descending and only get 100
          (err, articles) => {
            if (err) {
              console.error(err);
              reject(err);
            } else {
              resolve(articles);
            }
          }
        );
      });
    });
  },

  /**
   * Given an entities text and a timeframe, resolve with the article
   * ids that contain that entity.
   */
  getArticleIdsForEntity: function (entity, start = 0, end = 9999999999999) {
    return new Promise((resolve, reject) => {
      Entity.aggregate(
        { $match: { text: new RegExp('^' + entity + '$', 'i'), date: { $gte: new Date(start) , $lt: new Date(end) } } },
        { $group: { _id: '$text', value: { $push: '$article_id'} } },
        (err, res) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            resolve(res[0].value);
          }
        }
      );
    });
  },

  /**
   * Resolve with an object that contains the min and max dates in the Articles DB.
   */
  getMinAndMaxDates: function () {
    return Promise.join(this._getMinDate(), this._getMaxDate(), (min, max) => ({ min, max }));
  },

  /**
   * Resolve with the min date in the Articles DB.
   */
  _getMinDate: function () {
    return new Promise((resolve, reject) => {
      Article.find({}, 'date', {limit: 1, sort: {date: 1}}, (e, docs) => {
        if (e) {
          reject(e);
        } else {
          const date = docs[0] ? docs[0].date.getTime() : null;
          resolve(date);
        }
      });
    });
  },

  /**
   * Resolve with the max date in the Articles DB.
   */
  _getMaxDate: function () {
    return new Promise((resolve, reject) => {
      Article.find({}, 'date', {limit: 1, sort: {date: -1}}, (e, docs) => {
        if (e) {
          reject(e);
        } else {
          const date = docs[0] ? docs[0].date.getTime() : null;
          resolve(date);
        }
      });
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
    docs.forEach(doc => {
      if (doc) {
        const articleAndEntitityPrimitives = this._adaptFromAlchemyDoc(doc);
        if (articleAndEntitityPrimitives) {
          const articlePrimitive = articleAndEntitityPrimitives.article;
          if (articlePrimitive) {
            Article.findByIdAndUpdate(articlePrimitive._id, articlePrimitive, {upsert: true}, () => {});
          }
          const entityPrimitives = articleAndEntitityPrimitives.entities;
          if (entityPrimitives && entityPrimitives.length) {
            entityPrimitives.forEach(ep =>
              Entity.findByIdAndUpdate(ep._id, ep, {upsert: true}, () => {})
            );
          }
        }
      }
    });
  },

  /**
   * Given a response from Alchemy, create a new Article and Entities primitives
   */
  _adaptFromAlchemyDoc: function (doc) {
    const enrichedUrl = doc.source && doc.source.enriched && doc.source.enriched.url;
    let article;
    let entities;
    if (enrichedUrl) {
      article = {
        _id: doc.id,
        title: enrichedUrl.title,
        date: new Date(doc.timestamp * 1000),
        url: enrichedUrl.url
      }
      entities = enrichedUrl.entities.map(({ text, count, sentiment }) => {
        return {
          _id: text + doc.id,
          article_id: doc.id,
          date: new Date(doc.timestamp * 1000),
          text: text,
          count: count,
          sentiment: sentiment.score
        }
      }).filter(({ text }) => text.length > 1);
      if (entities.length) {
        return {
          article: article,
          entities: entities
        };
      }
    }
  },

  /** Remove all articles and entities older than 30 days */
  pruneOlderThan30d: function () {
    const date = moment().startOf('day').subtract(30, 'day').unix()*1000;
    const args = { date: { $lt: new Date(date) } };
    Article.remove(args, e => {
      if (e) { console.error(e); }
    });
    Entity.remove(args, e => {
      if (e) { console.error(e); }
    });
  },

  /**
   * Remove all entities with a text length of 1
   */
  pruneCharEntities: function () {
    Entity.remove({$where:"this.text.length == 1"}, e => {
      if (e) { console.error(e); }
    });
  }
}

module.exports = EntitiesDB;
