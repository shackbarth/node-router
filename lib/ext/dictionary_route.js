/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";

  var _ = X._,
    _fs = X.fs,
    _path = X.path,
    stringFetcher = require("./strings");

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
      Init.
     */
    init: function () {
      var model = this.get("clientModel"),
        handles = [];

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

      X.debug("xtr: ", xtr.url());
      if (xtr.url() === "/languages") {
        this.getSavedLanguages(xtr);
      } else if (xtr.url().indexOf("/fetch") === 0) { // ugly
        this.fetch(xtr);
      } else if (xtr.url() === "/save") {
        this.save(xtr);
      }
    },

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

    getEnglishSeed: function () {
      var seed,
        key,
        value,
        lexicon = [],
        strings = stringFetcher.getStrings();

      for (key in strings) {
        value = strings[key];
        lexicon.push({"key": key, "translation": value});
      }

      seed = {
        "lexicon": lexicon,
        "languageName": "English",
        "languageVersion": 1,
        "xTupleVersion": "4.0"
      };
      return seed;
    },

    getEmptySeed: function () {
      var seed,
        key,
        lexicon = [],
        strings = stringFetcher.getStrings();

      for (key in strings) {
        lexicon.push({"key": key, "translation": ""});
      }

      seed = {
        "lexicon": lexicon,
        "languageName": "",
        "languageVersion": 1,
        "xTupleVersion": ""
      };
      return seed;
    },

    jsonToDictionaryInstance: function (seed) {
      var i,
        entry,
        DictionaryModel = this.get("model"),
        dictionaryInstance = new DictionaryModel(),
        DictionaryEntryModel = X.dictionaryCache.model("DictionaryEntry"),
        dictionaryEntryInstance,
        date = new Date(),
        translator = "xTuple Default",
        dictionaryEntryInstances = [];

      for (i = 0; i < seed.lexicon.length; i++) {
        entry = seed.lexicon[i];

        dictionaryEntryInstance = new DictionaryEntryModel();
        dictionaryEntryInstance.date = date;
        dictionaryEntryInstance.translator = translator;
        dictionaryEntryInstance.key = entry.key;
        dictionaryEntryInstance.translation = entry.translation;
        dictionaryEntryInstances.push(dictionaryEntryInstance);
      }
      dictionaryInstance.lexicon = dictionaryEntryInstances;
      dictionaryInstance.xTupleVersion = seed.xTupleVersion;
      dictionaryInstance.languageName = seed.languageName;
      dictionaryInstance.languageVersion = seed.languageVersion;
      dictionaryInstance.translator = translator;

      return dictionaryInstance;
    },

    seedDatabase: function (xtr) {
      var seed = this.getEnglishSeed(),
        dictionaryInstance = this.jsonToDictionaryInstance(seed);

      dictionaryInstance.save(function (error, res) {
        if (error || !res) {
          return xtr.error({isError: true, reason: error});
        } else {
          xtr.write(res).close(); // or just write the seed?
        }
      });
    },

    fetch: function (xtr) {
      var that = this,
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

      console.log("language is " + languageName + " and version is " + xTupleVersion);
      // XXX figure out the best way to sort desc and return only one
      K.find({ languageName: languageName, xTupleVersion: xTupleVersion }, null,
        {sort: ["languageVersion"]}, function (error, dictionaries) {
          if (error) {
            return xtr.error({isError: true, reason: error});
          }
          latestDictionary = dictionaries[dictionaries.length - 1];
          if (!latestDictionary && languageName === "English") {
            // we really should always start with the English DB.
            // this must be the first request to the linguist app
            // let's seed the DB ourselves
            that.seedDatabase(xtr);

          } else if (!latestDictionary) {
            // first time this dictionary is asked for: create an empty one
            seed = JSON.parse(JSON.stringify(that.getEmptySeed())); // clone
            seed.languageName = languageName;
            seed.xTupleVersion = xTupleVersion;

            dictionaryInstance = that.jsonToDictionaryInstance(seed);
            dictionaryInstance.save(function (error, res) {
              if (error) {
                return xtr.error({isError: true, reason: error});
              } else {
                xtr.write(res).close(); // or write the seed
                //callback(null, {status: 200, body: JSON.stringify(seed)});
              }
            });

          } else {
            // default case: return the dictionary
            xtr.write(latestDictionary).close();
            //callback(null, {status: 200, body: JSON.stringify(latestDictionary)});
          }
        }
      );
    },


    findByKey: function (collection, keyName, key) {
      var i;
      for (i = 0; i < collection.length; i++) {
        if (collection[i][keyName] === key) {
          return collection[i];
        }
      }
      return null;
    },

    save: function (xtr) {
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
          newEntry = that.findByKey(newEntries, "key", key);
          if (newEntry &&
              (newEntry.translation || previousEntry.translation) &&
              newEntry.translation !== previousEntry.translation) {
            newLexicon.push({
              key: key,
              translation: newEntry.translation,
              translator: translatorName,
              date: now
            });
          } else {
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
            xtr.write("Dictionary " + (maxVersionId + 1) + " save successful").close();
          }
        });
      });
    }
  });
}());
