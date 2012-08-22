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
      var clientModel = this.get("clientModel"), method = xtr.get("method"),
          data = xtr.get("json");
      //X.debug("X.AdministrativeRoute.handle(): ", method);
      if (method === "PUT") this.update.apply(this, arguments);
      else if (method === "DELETE") this.delete.apply(this, arguments);
      else if (method === "POST") {
        //X.debug("METHOD POST: ", data);
        if (data.lookup) {
          delete data.lookup;
          //X.debug("yes lookup ", data);
          this.lookup(xtr, data);
        } else this.new.apply(this, arguments);
      } else this.fetch.apply(this, arguments);
    },
    fetch: function (xtr, id) {
      var model = this.get("model"), data;
      if (id) model.find({_id: id}, _.bind(this.didFind, this, xtr));
      else model.find({}, _.bind(this.didFind, this, xtr));
    },
    lookup: function (xtr, data) {
      var K = this.get("model");
      K.findOne(data, function (err, res) {
        //X.debug(err, res);
        if (err || !res) return xtr.error({isError: true, reason: err});
        xtr.write(res).close();
      });
    },
    update: function (xtr, id) {
      var K = this.get("model"), data = xtr.get("json");
      K.findById(id, function (err, k) {
        if (err) return xtr.error({isError: true, reason: err});
        delete data._id;
        _.each(data, function (value, key) {
          k[key] = value;
        });
        k.save(function (err) {
          if (err) return xtr.error({isError: true, reason: err});
          xtr.close();
        })
      });
    },
    delete: function (xtr, id) {
      var K = this.get("model");
      K.remove({_id: id}, function (err) {
        if (err) return xtr.error({isError: true, reason: err});
        xtr.close();
      });
    },
    new: function (xtr) {
      var K = this.get("model"), k;
      k = new K(xtr.get("json"));
      k.save(function (err) {
        if (err) X.warn(err);
        if (err) return xtr.error({isError: true, reason: err});
        xtr.close();
      });
    },
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
