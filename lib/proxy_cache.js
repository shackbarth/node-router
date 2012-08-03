/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global XT:true */

(function () {
  "use strict";
  
  XT.proxyCache = XT.Cache.create({prefix: "proxy"});
  XT.userCache = XT.Cache.create({prefix: "user"});
  
}());