/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";

  var _ = X._, _path = X.path, proxyRouter = X.Router.create({
    dropOnNotFound: false,
    routes: [X.dictionaryRoute]
  });

  X.Server.create({
    name: "Linguist Interface",
    port: X.options.linguistInterface.port,
    router: proxyRouter,
    autoStart: true,
    bindAddress: "localhost",
    init: function () {
      var server = X.connect(), root;
      root = _path.join(X.basePath, "wwwling");
      server.use(_.bind(this.route, this));
      server.use(X.connect.static(root, {redirect: true}));
      this.set("server", server);
      this._super.init.call(this);
    },
    route: function (req, res, next) {
      var xtr;
      (xtr = X.Response.create({
        request: req,
        response: res
      })).once("isReady", _.bind(function () {
        var router = this.get("router");
        if (!router.route(xtr)) next();
      }, this));
    }
  });
}());
