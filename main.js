#!/usr/bin/env node

/*jshint node:true, indent:2, curly:false, eqeqeq:true, immed:true, latedef:true, newcap:true, noarg:true,
regexp:true, undef:true, strict:true, trailing:true, white:true */
/*global X:true */

(function () {
  "use strict";

  require("xt");

  X.setup({
    autoStart: true,
    requireCache: true,
    requireServer: true,
    debugging: true,
    routesDirectory: "./lib/routes",
    secureSaltFile: "../node-datasource/lib/private/salt.txt",
    cache: {
      proxy: {
        hostname: "localhost",
        port: 27017,
        schemaDirectory: "./mongo_schemas/proxy",
        database: "xtproxy"
      },
      user: {
        hostname: "localhost",
        port: 27017,
        schemaDirectory: "./mongo_schemas/users",
        database: "xtusers"
      },
      dictionary: {
        hostname: "localhost",
        port: 27017,
        schemaDirectory: "./mongo_schemas/linguist",
        database: "xtling"
      }
    },
    proxy: {
      port: 9000
    },
    administratorInterface: {
      port: 9090
    },
    linguistInterface: {
      port: 9097
    }
  });

  require("./lib/proxy_cache");
  require("./lib/proxy_service");
  require("./lib/administravia");
  require("./lib/lingavia");
}());
