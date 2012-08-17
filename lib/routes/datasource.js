/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";
  
  var _ = X._;

  require("../ext/administrative_route");  
  
  X.datasourceRoute = X.AdministrativeRoute.create({
    update: function (xtr, id) {
      X.debug("datasource: my update handler was called: %@, %@".f(xtr.get("path"), id));
      X.debug(xtr.get("data"));
      xtr.close();
    },
    delete: function (xtr, id) {
      X.debug("datasource: my delete handler was called: %@, %@".f(xtr.get("path"), id));
      xtr.close();
    },
    new: function (xtr) {
      X.debug("datasource: my new handler was called: %@".f(xtr.get("path")));
      xtr.close();
    },
    clientModel: "datasource",
    model: function () {
      return X.proxyCache.model("Datasource");
    }.property()
  });
  
  //X.datasourceRoute = X.Route.create({
  //  handle: function (xtr) {
  //    //X.debug("handle(route, datasource): ", xtr.get("payload"), xtr.get("data"));
  //    var K = this.get("model");
  //    K.findOne(xtr.get("payload"), _.bind(this.found, this, xtr));
  //  },
  //  found: function (xtr, err, res) {
  //    if (err || !res) return xtr.error(err? err: "could not find");
  //    xtr.write(res.toObject()).close();
  //  },
  //  model: function () {
  //    return X.proxyCache.model("Datasource");
  //  }.property(),
  //  handles: "/lookup/datasource".w()
  //});
  
}());
