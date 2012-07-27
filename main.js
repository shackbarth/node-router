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
    routesDirectory: "./lib/routes",
    cache: {
      proxy: {
        hostname: "localhost",
        port: 27017,
        schemaDirectory: "./mongo_schemas",
        database: "xtproxy"
      }
    },
    proxy: {
      port: 9000
    }
  });

  require("./lib/proxy_cache");
  require("./lib/proxy_service");
}());