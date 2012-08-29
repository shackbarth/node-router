/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";

  var _ = X._, _fs = X.fs, _path = X.path;

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
      } else if (xtr.url().indexOf("/fetch?") === 0) { // ugly
        this.fetch(xtr);
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

    fetch: function (xtr) {
      var url = require("url"),
        queryData = url.parse(xtr.url(), true).query,
        languageName = queryData.languageName,
        xTupleVersion = queryData.xTupleVersion,
        latestDictionary,
        dictionaryEntry,
        i,
        seed,
        K = this.get("model");

      console.log("language is " + languageName + " and version is " + xTupleVersion);
      // XXX figure out the best way to sort desc and return only one
      K.find({ languageName: languageName, xTupleVersion: xTupleVersion }, null,
        {sort: ["languageVersion"]}, function (error, dictionaries) {
          if (error) {
            callback(null, {status: 500, body: error});
            return;
          }
          latestDictionary = dictionaries[dictionaries.length - 1];
          if (!latestDictionary && languageName === "English") {
            // we really should always start with the English DB.
            // this must be the first request to the linguist app
            // let's seed the DB ourselves
            seedDatabase(request, null, callback);

          } else if (!latestDictionary) {
            // first time this dictionary is asked for: create an empty one
            seed = JSON.parse(JSON.stringify(getEmptySeed())); // clone
            seed.languageName = languageName;
            seed.xTupleVersion = xTupleVersion;

            dictionaryInstance = jsonToDictionaryInstance(seed);
            dictionaryInstance.save(function (error) {
              if (error) {
                callback(null, {status: 500, body: error});
              } else {
                callback(null, {status: 200, body: JSON.stringify(seed)});
              }
            });

          } else {
            // default case: return the dictionary
            callback(null, {status: 200, body: JSON.stringify(latestDictionary)});
          }
        }
      );
    }
  });
}());
