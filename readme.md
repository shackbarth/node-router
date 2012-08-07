# Router

> A Node.js web service designed for deployment in a cloud environment and one piece
> of the Postbooks cloud technology stack. Exposes a REST API for [node-datasource](http://github.com/xtuple/node-datasource)
> clients to lookup users for authentication and for managing Database Servers, Organizations
> and Users.

### Dependencies

* [node](http://github.com/joyent/node) -- 0.6.9
* [mongodb](http://github.com/mongodb/mongo) -- 2.1.2
* [node-xt](http://github.com/xtuple/node-xt) -- master (npm dependency)
* [node-schemas](http://github.com/xtuple/node-schemas) -- (embedded submodule)
* [client](http://github.com/xtuple/client) -- master
* [node-datasource](http://github.com/xtuple/node-datasource) -- master

###### Special Note

> While production deployment strategies will separate the components in many ways,
> the route followed in these instructions is for development and assumes a single
> server for all web service components in the stack. This is especially important
> to note in terms of the [client](http://github.com/xtuple/client) as various
> interfaces require pieces of its code base but will need to execute separately
> moving forward.

### Setup

___If you have already followed the directions for [node-datasource](http://github.com/xtuple/node-datasource) 
then [node-xt](http://github.com/xtuple/node-xt) and [client](http://github.com/xtuple/client) 
are already available in the correct location and you do not need to clone them again.___

Once [node](http://github.com/joyent/node) has been setup and is available to your
environment, ensure that you have cloned [node-xt](http://github.com/xtuple/node-xt) and 
[client](http://github.com/xtuple/client) alongside the [node-datasource](http://github.com/xtuple/node-datasource) and
[node-router](http://github.com/xtuple/node-router) repositories.  

For all of the [node](http://github.com/joyent/node) layer components in the stack they
require the [node-xt](http://github.com/xtuple/node-xt) framework as a dependency. It is
possible to, from the project root, execute `npm install` and have it clone another copy
for you. Rather than do this, from the root of the [node-router](http://github.com/xtuple/node-router) repository, `mkdir node_modules`. Then `cd node_modules` and `ln -s ../../node-xt ./xt`. This way, the local pieces will be sharing the
[node-xt](http://github.com/xtuple/node-xt) installation. If you have not already done so, make sure to execute `npm install` from within the [node-xt](http://github.com/xtuple/node-xt) project root, if you have already setup [node-datasource](http://github.com/xtuple/node-datasource) you will have already done this. If you have not setup [node-datasource](http://github.com/xtuple/node-datasource) you need to do that now. From the [node-router](http://github.com/xtuple/node-router) project root, you need to initialize the embedded [node-schemas](http://github.com/xtuple/node-schemas) submodule with `git submodule update --init`.

All of the configuration options for the [node-router](http://github.com/xtuple/node-router) are in the `main.js` file. Most likely you will not need to modify any of these options during development. Only in a production deployment should this need to be reevaluated (as ugly as it is for now).

So, a complete list of the executed commands are as follows:

```bash
git clone git@github.com:xtuple/node-xt.git
git clone git@github.com:xtuple/node-datasource.git
git clone git@github.com:xtuple/client.git
git clone git@github.com:xtuple/node-router.git
cd node-xt
npm install
cd ../node-router
mkdir node_modules
cd node_modules
ln -s ../../node-xt ./xt
cd ..
git submodule init --update
# make sure to setup node-datasource according to its directions now
```

##### Special Note

> An ugly fault of the current configuration is the way the salt is shared. Out of the box the [node-router](http://github.com/xtuple/node-router) defaults to looking at `../node-datasource/lib/private/salt.txt` unless otherwise specified _in it's own configuration_. This will be changed in the future. The salt ___must be the same___ or authentication cannot be consistent between them. If the salt is changed after users have been created (see [node-router](http://github.com/xtuple/node-router) documentation) their passwords will ___have___ to be updated or they cannot log in to the system.

##### Special Note

> If you have not already followed the setup directions for [client](http://github.com/xtuple/client) you need to do that now.

At this point the [node-router](http://github.com/xtuple/node-router) should be ready to
run with the command `./main.js`. Unless the configuration has changed, it is assumed there is a running instance of [mongodb](http://github.com/mongodb/mongo) running locally on its default port `27017`.

##### Special Note

> Before the client can be used, entries must be made in the administrative interface that is automatically available 
> on `localhost:9090` when running [node-router](http://github.com/xtuple/node-router). Use this interface to create users, 
> organizations and database server entries. ___DOCUMENTATION FOR THIS INTERFACE HAS NOT BEEN WRITTEN TO DATE___