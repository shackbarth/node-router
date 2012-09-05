/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";
  
  var salt, crypt, _fs = X.fs, _path = X.path, _ = X._;
  
  require("../ext/administrative_route");
  
  salt = _fs.readFileSync(_path.join(X.basePath, X.secureSaltFile), "utf8").trim();
  
  crypt = function (password) {
    var md5 = X.crypto.createHash('md5');
    md5.update(salt + password);
    return md5.digest('hex');
  };
  
  X.userRoute = X.AdministrativeRoute.create({
    update: function (xtr, id) {   
      var data = xtr.get("json"), password = null, K = this.get("model");
      if (data.password) password = crypt(data.password);
      K.findOne({_id: data._id}, function (err, k) {
        if (err || !k) {
          return xtr.error({isError: true, reason: err? err: "could not find user"});
        }
        delete data._id;
        if (data.password) data.password = password;
        else delete data.password;
        _.each(data, function (v, key) {
          k[key] = data[key];
        });
        k.save(function (err) {
          if (err) return xtr.error({isError: true, reason: err});
          xtr.close();
        })
      });
    },
    new: function (xtr) {
      var K = this.get("model"), k;
      k = new K(xtr.get("json"));
      k.password = crypt(k.password);
      k.save(function (err) {
        if (err) X.warn(err);
        if (err) return xtr.error({isError: true, reason: err});
        xtr.close();
      });
    },
    didFind: function (xtr, err, res) {
      if (err || !res) {
        return xtr.error({isError: true, reason: err? err: "unknown failure"});
      }
      if (X.typeOf(res) === X.T_ARRAY) {
        res = res.map(function (elem) {elem.password = null; return elem});
      } else { res.password = null; }
      //X.debug("X.userRoute.didFind(): ", X.typeOf(res), res);
      xtr.write(res).close();
    },
    clientModel: "user",
    model: function () {
      return X.userCache.model("User");
    }.property()
  });
}());
