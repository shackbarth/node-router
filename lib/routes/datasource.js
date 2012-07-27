/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global XT:true */

(function () {
  "use strict";
  
  var _ = XT._;
  
  XT.datasourceRoute = XT.Route.create({
    handle: function (xtr) {
      //XT.debug("handle(route, datasource): ", xtr.get("payload"), xtr.get("data"));
      var K = this.get("model");
      K.findOne(xtr.get("payload"), _.bind(this.found, this, xtr));
    },
    found: function (xtr, err, res) {
      if (err || !res) return xtr.error(err? err: "could not find");
      xtr.write(res.toObject()).close();
    },
    model: function () {
      return XT.proxyCache.model("Datasource");
    }.property(),
    handles: "/lookup/datasource".w()
  });
  
}());