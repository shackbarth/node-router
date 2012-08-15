/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";
  
  var proxyRouter = X.Router.create({
    routes: [X.datasourceRoute, X.organizationRoute, X.databaseRoute]
  });
  
  X.Server.create({
    name: "Proxy",
    port: X.options.proxy.port,
    router: proxyRouter,
    autoStart: true
  });
  
}());
