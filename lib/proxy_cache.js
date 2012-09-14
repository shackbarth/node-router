/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";

  X.proxyCache = X.Cache.create({prefix: "proxy"});
  X.userCache = X.Cache.create({prefix: "user"});
  X.dictionaryCache = X.Cache.create({prefix: "dictionary"});

}());
