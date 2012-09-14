/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";

  var _ = X._;

  require("../ext/dictionary_route");

  X.dictionaryRoute = X.DictionaryRoute.create({
    clientModel: "dictionary",
    model: function () {
      return X.dictionaryCache.model("Dictionary");
    }.property()
  });


}());
