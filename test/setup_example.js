#!/usr/bin/env node

/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global XT:true */

(function () {
  "use strict";

  require("xt");
  
  XT.setup({
    autoStart: true,
    requireCache: true,
    requireServer: true,
    debugging: true,
    routesDirectory: "../lib/routes",
    cache: {
      proxy: {
        hostname: "localhost",
        port: 27017,
        schemaDirectory: "../mongo_schemas",
        database: "xtproxy"
      }
    },
    proxy: {
      port: 9000
    }
  });

  require("../lib/proxy_cache");

  var K = XT.proxyCache.model("DatabaseServer"), k;
  k = new K({
    name: "dev1",
    hostname: "localhost",
    port: 5432,
    description: "Cole's localhost database, won't work for anyone else",
    location: "Cole's laptop so can't be mapped to a subnet...",
    dateAdded: new Date().getTime()
  });
  k.save();
  
  k = new K({
    name: "production1",
    hostname: "bigiron.xtuple.com",
    port: 5432,
    description: "Current development public database in the cloud",
    location: "Not sure, somewhere high in they sky...",
    dateAdded: new Date().getTime()
  });
  k.save();
  
  K = XT.proxyCache.model("Datasource");
  
  k = new K({
    name: "development",
    hostname: "localtest.com",
    port: 443,
    description: "Local (localhost) mapped datasource instance, " +
      "/etc/hosts file or local dns should map localtest.com to localhost",
    location: "God only knows",
    dateAdded: new Date().getTime()
  });
    
    var Model = XT.proxyCache.model("Organization"), m;
    m = new Model({
      name: "40beta",
      database: "dev1",
      description: "Cole's localhost database",
      cloud: "N/A"
    });
    m.save();
    XT.debug("done with 40beta on dev1");
  
  
    m = new Model({
      name: "production",
      database: "production1",
      description: "Cloud development organization/database?",
      cloud: "Pretty sure this is an EC2 instance"
    });
    m.save();
    XT.debug("done with production on production1");
}());



