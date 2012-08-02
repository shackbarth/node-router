/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global XT:true */

(function () {
  "use strict";
  
  var _ = XT._, _fs = XT.fs, _path = XT.path, salt, crypt;
  
  salt = _fs.readFileSync(_path.join(XT.basePath, XT.secureSaltFile), "utf8").trim();
  
  crypt = function (password) {
    var md5 = XT.crypto.createHash('md5');
    md5.update(salt + password);
    return md5.digest('hex');
  };
  
  XT.userRoute = XT.Route.create({
    handle: function (xtr) {
      //XT.debug("handle(route, database): ", xtr.get("payload"), xtr.get("data"));
      var K = this.get("model"), path = xtr.get("path");
      
      switch(path) {
        case "/lookup/users":
          K.find({}, _.bind(this.foundAll, this, xtr));
          break;
        case "/lookup/user":  
          K.findOne(xtr.get("payload"), _.bind(this.found, this, xtr));
          break;
        case "/save/user":
          this.save(xtr);
          break;
        case "/delete/user":
          this.deleteEntry(xtr);
          break;
      }
    },
    found: function (xtr, err, res) {
      if (err || !res) return xtr.error(err? err: "could not find");
      xtr.write(res.toObject()).close();
    },
    foundAll: function (xtr, err, res) {
      if (err || !res) return xtr.error(err? err: "none found");
      xtr.write(res).close();
    },
    save: function (xtr) {
      var data = xtr.get("payload"), K = this.get("model"), k;
      // order of events, try to find one like it, if its found, try to
      // update it, if not found, create a whole new entry, if that fails
      // ...i dunno...
      
      if (!data || _.keys(data).length === 0) return xtr.error({isError: true, reason: "invalid data"});
      
      K.findOne({id: data.id}, function (err, res) {
        if (err || !res) {
          if (err) return xtr.error({isError: true, reason: err? err: "unknown error"});
          
          var orgs = [], split, parts;
          if (data.organizations) {
            split = data.organizations.split(",");
            _.each(split, function (obj) {
              parts = obj.trim().split(":");
              orgs.push({name: parts[0], username: parts[1]});
            });
          }
          data.organizations = orgs;
          
          if (!data.password) return xtr.error({isError: true, reason: "must have a password on new entries"});
          
          data.password = crypt(data.password);
          
          k = new K(data);
          k.save(function (err) {
            if (err) xtr.error({isError: true, reason: err? err: "unknown error during save"});
            else xtr.write({success: true}).close();
          })
          return;
        } else {
          var keys = _.keys(res.toObject());
          _.each(keys, function (key) {
            if (key === "organizations") {
              if (!data.organizations) return;
              
              var orgs = [], split, parts;
              split = data.organizations.split(",");
              _.each(split, function (org) {
                parts = org.trim().split(":");
                orgs.push({name: parts[0], username: parts[1]});
              });
              res.organizations = orgs;
              
              //var orgs = res.organizations, split, parts, found, idx;
              //split = data.organizations.split(",");
              //_.each(split, function (org) {
              //  parts = org.trim().split(":");
              //  found = _.find(orgs, function (obj, i) {
              //    XT.debug("find, ", obj);
              //    if (parts[0] === obj.name) {
              //      XT.debug("yup ", parts[0], obj.name);
              //      idx = i;
              //      return true;
              //    }
              //    return false;
              //  });
              //  if (found) {
              //    XT.debug("think i found something");
              //    orgs[idx].name = parts[0];
              //    orgs[idx].username = parts[1];
              //  } else {
              //    XT.debug("nope must be new! ", parts);
              //    orgs.push({name: parts[0], username: parts[1]});
              //  }
              //});
              ////res.organizations = orgs;
              //
              //
              //XT.debug(res.organizations, " ", orgs);
            } else if (key === "password") {
              if (res.password !== data.password) {
                res.password = crypt(data.password);
              }
            } else {
              if (data[key] && data[key] !== res[key]) res[key] = data[key];
            }
          });
          res.save(function (err) {
            if (err) xtr.error({isError: true, reason: err? err: "unknown error during update"});
            else xtr.write({success: true}).close();
          });
        }
      });
    },
    deleteEntry: function (xtr) {
      var data = xtr.get("payload"), K = this.get("model");
      
      if (!data || _.keys(data).length === 0) return xtr.error({isError: true, reason: "invalid data"});
      
      K.remove({name: data.name}, function (err) {
        if (err) {
          return xtr.error({isError: true, reason: err? err: "unknown error during delete"});
        } else xtr.write({success: true}).close();
      })
    },
    model: function () {
      return XT.userCache.model("User");
    }.property(),
    handles: "/lookup/user /lookup/users /save/user /delete/user".w()
  });
  
}());