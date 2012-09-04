/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";

  var _ = X._;

  /**
    Dictionary route

    @class
    @extends X.Route
   */
  X.DictionaryRoute = X.Route.extend(/** @lends X.DictionaryRoute */{
    /**
      The name of the model that this route will operate on.

      @type {String}
     */
    clientModel: "",

    /**
      Declares handle paths.
     */
    init: function () {
      var handles = [];

      handles.push("/languages");
      handles.push("/fetch");
      handles.push("/save");
      //handles.push("/%@/:id".f(model));
      //handles.push("/%@s".f(model));
      //handles.push("/%@".f(model));
      this.set("handles", handles);
      this._super.init.call(this);
    },

    /**
      Sends requests to the appropriate function

      @param {X.Reponse} xtr
     */
    handle: function (xtr) {
      var clientModel = this.get("clientModel"), method = xtr.get("method"),
        data = xtr.get("json");

      if (xtr.url() === "/languages") {
        this.getSavedLanguages(xtr);
      } else if (xtr.url().indexOf("/fetch") === 0) {
        this.fetch(xtr);
      } else if (xtr.url() === "/save") {
        this.save(xtr);
      }
    },

    /**
      Writes to xtr an array of the currently available languages.

      @param {X.Response} xtr
     */
    getSavedLanguages: function (xtr) {
      var K = this.get("model");

      K.collection.distinct("languageName", function (err, res) {
        if (err || !res) {
          return xtr.error({isError: true, reason: err});
        } else {
          xtr.write(res).close();
        }
      });
    },

    /**
      Fetches and writes to xtr the latest avaiable dictionary based
      on the parameters of the url string. Assumes the url string will look like
      ?languageName=French&xTupleVersion=4.0

      @param {X.Response} xtr
     */
    fetch: function (xtr) {
      var utils = require("../resources/dictionary_seed_utils"),
        url = require("url"),
        queryData = url.parse(xtr.url(), true).query,
        languageName = queryData.languageName,
        xTupleVersion = queryData.xTupleVersion,
        latestDictionary,
        dictionaryInstance,
        dictionaryEntry,
        i,
        seed,
        K = this.get("model");

      // XXX figure out the best way to sort desc and return only one
      K.find({ languageName: languageName, xTupleVersion: xTupleVersion }, null,
        {sort: ["languageVersion"]}, function (error, dictionaries) {
          if (error) {
            return xtr.error({isError: true, reason: error});
          }
          latestDictionary = dictionaries[dictionaries.length - 1];
          if (!latestDictionary && languageName === "English") {
            // case 1:
            // this must be the first request to the linguist app
            // we have to seed the DB with a base English dictionary
            utils.seedDatabase(function (error, res) {
              if (error || !res) {
                return xtr.error({isError: true, reason: error});
              } else {
                xtr.write(res).close();
              }
            });

          } else if (!latestDictionary) {
            // case 2:
            // this first time this (foreign-language) dictionary is asked for
            // so we create an empty one
            seed = JSON.parse(JSON.stringify(utils.getEmptySeed())); // clone
            seed.languageName = languageName;
            seed.xTupleVersion = xTupleVersion;

            dictionaryInstance = utils.jsonToDictionaryInstance(seed);
            dictionaryInstance.save(function (error, res) {
              if (error) {
                return xtr.error({isError: true, reason: error});
              } else {
                xtr.write(res).close();
              }
            });

          } else {
            // case 3: This dictionary does already exists. Return the dictionary
            xtr.write(latestDictionary).close();
          }
        }
      );
    },

    /**
      Saves a revision to a dictionary by comparing the translator's
      submission with the previous existing dictionary and giving
      them credit for all of the diffs, while leaving all unchanged
      words under the original authorship.

      @param {X.response} xtr
     */
    save: function (xtr, callback) {
      var that = this,
        jsonPost = xtr.json(),
        languageName = jsonPost.languageName,
        xTupleVersion = jsonPost.xTupleVersion,
        newEntries = jsonPost.lexicon,
        newEntry,
        latestDictionary,
        maxVersionId,
        previousLexicon,
        previousEntry,
        newLexicon = [],
        i,
        key,
        DictionaryModel = this.get("model"),
        dictionaryInstance = new DictionaryModel(),
        now = new Date(),
        translatorName = "TranslatorNameFromSession";

      if (languageName.toLowerCase() === 'english') {
        return xtr.error({isError: true, reason: "Please stop trying to hack our database"});
      }

      // XXX figure out the best way to sort desc and return only one
      DictionaryModel.find({ languageName: languageName, xTupleVersion: xTupleVersion },
          null, {sort: ["languageVersion"]}, function (error, dictionaries) {

        if (error) {
          return xtr.error({isError: true, reason: error});
        }

        latestDictionary = dictionaries[dictionaries.length - 1];

        maxVersionId = latestDictionary.languageVersion;
        previousLexicon = latestDictionary.lexicon;
        for (i = 0; i < previousLexicon.length; i++) {
          previousEntry = previousLexicon[i];
          key = previousEntry.key;
          newEntry = _.find(newEntries, function (entry) {
            return entry.key === key;
          });
          if (newEntry &&
              (newEntry.translation || previousEntry.translation) &&
              newEntry.translation !== previousEntry.translation) {
            // this word has been updated! Save the new word
            newLexicon.push({
              key: key,
              translation: newEntry.translation,
              translator: translatorName,
              date: now
            });
          } else {
            // this word has not been updated. Keep the old word.
            newLexicon.push(previousEntry);
          }
        }
        dictionaryInstance.lexicon = newLexicon;
        dictionaryInstance.xTupleVersion = xTupleVersion;
        dictionaryInstance.languageName = languageName;
        dictionaryInstance.languageVersion = maxVersionId + 1;

        dictionaryInstance.save(function (error) {
          if (error) {
            return xtr.error({isError: true, reason: error});
          } else {
            xtr.write(dictionaryInstance).close();
            if (callback) {
              callback(null, xtr);
            }
          }
        });
      });

    }
  });
}());
