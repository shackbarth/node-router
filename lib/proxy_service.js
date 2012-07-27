/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global XT:true */

(function () {
  "use strict";
  
  var proxyRouter = XT.Router.create({
    routes: [XT.datasourceRoute, XT.organizationRoute, XT.databaseRoute]
  });
  
  XT.Server.create({
    name: "Proxy",
    port: XT.options.proxy.port,
    router: proxyRouter,
    autoStart: true
  });
  
}());