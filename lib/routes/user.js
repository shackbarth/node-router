/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";
  
  var salt, crypt, _fs = X.fs, _path = X.path;
  
  require("../ext/administrative_route");
  
  salt = _fs.readFileSync(_path.join(X.basePath, X.secureSaltFile), "utf8").trim();
  
  crypt = function (password) {
    var md5 = X.crypto.createHash('md5');
    md5.update(salt + password);
    return md5.digest('hex');
  };
  
  X.userRoute = X.AdministrativeRoute.create({
    update: function (xtr, id) {
      X.debug("my update handler was called: %@, %@".f(xtr.get("path"), id));
      X.debug(xtr.get("data"));
      xtr.close();
    },
    delete: function (xtr, id) {
      X.debug("my delete handler was called: %@, %@".f(xtr.get("path"), id));
      xtr.close();
    },
    new: function (xtr) {
      X.debug("my new handler was called: %@".f(xtr.get("path")));
      xtr.close();
    },
    clientModel: "user",
    model: function () {
      return X.userCache.model("User");
    }.property()
  });
}());
