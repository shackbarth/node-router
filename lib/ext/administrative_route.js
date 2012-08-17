/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";
  
  var _ = X._, _fs = X.fs, _path = X.path;
  
  X.AdministrativeRoute = X.Route.extend({
    clientModel: "",
    init: function () {
      var model = this.get("clientModel"), handles = [];
      handles.push("/%@/:id".f(model));
      handles.push("/%@s".f(model));
      handles.push("/%@".f(model));
      this.set("handles", handles);
      this._super.init.call(this);
    },
    handle: function (xtr) {
      var clientModel = this.get("clientModel"), method = xtr.get("method");
      //X.debug("X.AdministrativeRoute.handle(): ", method);
      if (method === "PUT") this.update.apply(this, arguments);
      else if (method === "DELETE") this.delete.apply(this, arguments);
      else if (method === "POST") this.new.apply(this, arguments);
      else this.fetch.apply(this, arguments);
    },
    fetch: function (xtr, id) {
      var model = this.get("model");
      if (id) model.find({_id: id}, _.bind(this.didFind, this, xtr));
      else model.find({}, _.bind(this.didFind, this, xtr));
    },
    update: function () {},
    delete: function () {},
    new: function () {},
    didFind: function (xtr, err, res) {
      if (err || !res) {
        return xtr.error({isError: true, reason: err? err.message: "unknown failure"});
      }
      //X.debug("X.AdministrativeRoute.didFind(): ", X.typeOf(res), res);
      xtr.write(res).close();
    },
    className: "X.AdministrativeRoute"
  });
  
}());
