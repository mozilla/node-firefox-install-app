var Connect = require('fxos-connect');
var findApp = require('fxos-findapp');
var FirefoxClient = require('firefox-client');
var Manifest = require('firefox-app-validator-manifest');
var ff = new Manifest();
var fs = require('fs');
var Q = require('q');
var uuid = require('node-uuid');
var __ = require('underscore');
var path = require('path')

Q.longStackSupport = true;

module.exports = deployB2G;

function validateManifest (manifestURL) {
  var defer = Q.defer();

  Q.nfcall(fs.readFile, manifestURL, 'utf8')
    .then(function(manifest) {
      return ff.validate(manifest, {});
    })
    .then(function(result) {
      if (result.errors) {
        return defer.reject(result.errors);
      }
      
      defer.resolve(result);
    })
    .done();

  return defer.promise;
}

function deployB2G () {

  var args = arguments;
  var opts = {};
  var callback;

  /* Overloading */

  // deployB2G(manifestURL, zip [, client])
  if (typeof args[0] == 'string' && (typeof args[1] == 'string')) {
    opts.manifestURL = args[0];
    opts.zip = args[1];
    if (args[2] instanceof FirefoxClient) {
      opts.client = args[2];
    }
  }
  // deployB2G({zip: zip_path, manifestURL: manifest_path[, client: firefox_client]})
  else if (typeof args[0] == 'object') {
    opts = args[0];
  }

  // deployB2G(..., callback)
  if (typeof args[args.length-1] == 'function') {
    callback = args[args.length-1];
  }

  /* Options */

  // Missing manifest or zip
  if (!opts.manifestURL || !opts.zip) {
    throw new Error('No manifest or zip file');
  }

  opts.manifestURL = path.resolve(opts.manifestURL);
  opts.zip = path.resolve(opts.zip);

  // If no client is passed, it must connect through FirefoxClient
  var keepAlive = opts.client ? true : false;

  // UUID of the app
  var appId = uuid.v1();

  /* Promises */

  var simulator = Connect(__(opts).extend({connect: true}));
  var webappsActor = Q.when(simulator, function(sim) {
    return Q.ninvoke(sim.client, 'getWebapps');
  });
  var appActor = Q.when(simulator, function(sim) {
    return findApp(__.extend(opts, sim));
  });

  function uninstall () {
    return Q.all([webappsActor, appActor]).spread(function(webapps, app) {
      return Q.ninvoke(webapps, 'uninstall', app.manifest.manifestURL);
    })
    .catch(function(err) {
      console.log("WARN fxos-deploy:",err);
    });
  }

  function install () {
    return webappsActor.then(function(webapps) {
      return Q.ninvoke(webapps, 'installPackaged', opts.zip, appId);
    });
  }

  function launch() {
    if (opts.launch !== false) {
      return webappsActor.then(function(webapps) {
        return Q.ninvoke(webapps, 'launch', 'app://'+appId+'/manifest.webapp');
      });
    }
    return Q();
  }

  return simulator
    .then(uninstall)
    .then(install)
    .then(launch)
    .then(function() {
      if (!keepAlive) {
        return simulator
          .then(function(sim) {
            sim.client.disconnect();
          });
      }
    })
    .then(function() {
      if (callback) callback(null, appId);
      return appId;
    });
}
