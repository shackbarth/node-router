/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global XT:true */

(function () {
  "use strict";
  
  var _path = XT.path, proxyRouter = XT.Router.create({
    routes: [XT.datasourceRoute, XT.organizationRoute, XT.databaseRoute]
  });
  
  XT.Server.create({
    name: "Administrator Interface",
    port: XT.options.administratorInterface.port,
    router: proxyRouter,
    autoStart: true,
    bindAddress: "localhost",
    init: function () {
      var server = XT.connect(), root;
      root = _path.join(XT.basePath, "www");
      server.use(XT.connect.static(root, {redirect: true}));
      this.set("server", server);
      this._super.init.call(this);
    }
  });
  
}());