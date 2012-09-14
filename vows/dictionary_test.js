/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";

  var vows = require('vows'),
    assert = require('assert'),
    dictionaryUtils = require('../lib/resources/dictionary_seed_utils');

  require('../node_modules/xt/xt');
  X.options = {
    cache: {
      dictionary: {
        hostname: "localhost",
        port: 27017,
        schemaDirectory: "./mongo_schemas/linguist",
        database: "xtling_test"
      }
    }
  };
  require('../node_modules/xt/database/cache');
  require('../node_modules/xt/database/ext/mongoose_schema');
  X.dictionaryCache = X.Cache.create({prefix: "dictionary"});
  require('../node_modules/xt/server/ext/route');
  require('../lib/ext/dictionary_route');
  require('../lib/routes/dictionary');


  vows.describe('The dictionary datasource layer').addBatch({

    'when loading the english seed': {
      topic: function () { return dictionaryUtils.getEnglishSeed(); },

      'we get a json seed which ': {
        'is at version 1': function (topic) {
          assert.equal(topic.languageVersion, 1);
        },
        'has a lot of words in it ': function (topic) {
          assert.isTrue(topic.lexicon.length > 10);
          assert.isTrue(topic.lexicon[0].translation.length > 0);
        },
        'is in English': function (topic) {
          assert.equal(topic.languageName, "English");
        }
      }
    },

    'when loading the empty seed': {
      topic: function () { return dictionaryUtils.getEmptySeed(); },

      'we get a json seed which ': {
        'is at version 1': function (topic) {
          assert.equal(topic.languageVersion, 1);
        },
        'has a lot of untranslated words in it ': function (topic) {
          assert.isTrue(topic.lexicon.length > 10);
          assert.equal(topic.lexicon[0].translation, "");
        },
        'has no language': function (topic) {
          assert.equal(topic.languageName, "");
        }
      }
    },

    'when creating a dictionary instance from a seed': {
      topic: function () {
        var seed = {
          "lexicon": [{ key: "_number", translation: "Nombre" }],
          "languageName": "French",
          "languageVersion": 1,
          "xTupleVersion": "4.0"
        };
        return dictionaryUtils.jsonToDictionaryInstance(seed);
      },

      'we get a dictionary instance which ': {
        'has xTuple default as the translator': function (topic) {
          assert.lengthOf(topic.lexicon, 1);
          assert.equal(topic.lexicon[0].translator, "xTuple Default");
        },
        'has the language and xTuple version we passed into it ': function (topic) {
          assert.equal(topic.languageName, "French");
          assert.equal(topic.xTupleVersion, "4.0");
        }
      }
    },

    'after a test dictionary instance is saved': {
      topic: function () {
        var seed = {
          "lexicon": [],
          "languageName": "French",
          "languageVersion": 1,
          "xTupleVersion": "4.0"
        };
        var jsonData = {
          languageName: "French",
          xTupleVersion: "4.0",
          lexicon: [
            {key: "_order", translation: "Ordre", translator: "Seed"},
            {key: "_number", translation: "", translator: "Seed"}
          ]
        },
          jsonFunction = function () { return jsonData; },
          xtr = {
            json: jsonFunction,
            error: function (error) { this.errorLog += error.reason; },
            errorLog: '',
            write: function (data) { this.written += data; },
            written: ''
          },

          DictionaryModel = X.dictionaryCache.model("Dictionary"),
          dictionaryInstance = new DictionaryModel();

        DictionaryModel.find({}).remove(); // clear out collection
        // still figuring out where to do this kind of stuff if vows

        dictionaryInstance.lexicon = xtr.json().lexicon;
        dictionaryInstance.xTupleVersion = xtr.json().xTupleVersion;
        dictionaryInstance.languageName = xtr.json().languageName;
        dictionaryInstance.languageVersion = 1;
        dictionaryInstance.save(this.callback);
      },

      'I can submit a valid update': {
        topic: function (dictionary) {
          // monkeypatch xtr
          var jsonData = {
            languageName: "French",
            xTupleVersion: "4.0",
            lexicon: [
              {key: "_order", translation: "Ordre"},
              {key: "_number", translation: "Nombre"}
            ]
          },
            jsonFunction = function () { return jsonData; },
            xtr = {
              json: jsonFunction,
              error: function (error) { this.errorLog += error.reason; },
              errorLog: '',
              write: function (data) {
                this.written = data;
                return {close: function () {}};
              },
              written: null
            };

          X.dictionaryRoute.save(xtr, this.callback);
        },

        'then we merge the dictionaries such that': {
          'no error occurs': function (topic) {
            assert.equal(topic.errorLog, '');
            assert.isNotNull(topic.written);
          },
          'the lexicon keeps the unchanged translations with the old name but updates the new': function (topic) {
            var lexicon = topic.written.lexicon,
              order = X._.find(lexicon, function (entry) { return entry.key === '_order'; }),
              number = X._.find(lexicon, function (entry) { return entry.key === '_number'; });

            assert.equal(order.translator, 'Seed');
            assert.equal(order.translation, 'Ordre');
            assert.equal(number.translator, 'TranslatorNameFromSession');
            assert.equal(number.translation, 'Nombre');
          },
          'the language version has been incremented': function (topic) {
            assert.equal(topic.written.languageVersion, 2);
          }
        }
      }
    },
    'when trying to submit an English-language dictionary': {
      topic: function () {
        // monkeypatch xtr
        var jsonData = {languageName: "English"},
          jsonFunction = function () { return jsonData; },
          xtr = {
            json: jsonFunction,
            error: function (error) { this.errorLog += error.reason; },
            errorLog: ''
          };
        X.dictionaryRoute.save(xtr);
        return xtr;
      },

      'our security will stop you': function (topic) {
        assert.equal(topic.errorLog, 'Please stop trying to hack our database');
      }
    }
  }).export(module);

}());
