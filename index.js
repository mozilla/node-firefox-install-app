var startB2G = require('fxos-start');
var findappB2G = require('fxos-findapp');
var FirefoxClient = require('firefox-client');
var Manifest = require('firefox-app-validator-manifest');
var ff = new Manifest();
var fs = require('fs');
var Q = require('q');
var uuid = require('node-uuid');

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

function _deployB2G (opts, callback) {
  // TODO: Validate the manifest
  // var validate = validateManifest(opts.manifestURL);

  
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

  // If no client is passed, it must connect through FirefoxClient
  if (!opts.client) opts.connect = true;

  // UUID of the app
  var appId = uuid.v1();

  /* Promises */

  var simulator = startB2G(opts);
  var webappsActor = Q.when(simulator, function() {
    return Q.ninvoke(opts.client, 'getWebapps');
  });
  var appActor = Q.when(simulator, function() {
    return findappB2G(opts);
  });

  function uninstall () {
    return Q.all([webappsActor, appActor]).spread(function(webapps, app) {
      return Q.ninvoke(webapps, 'uninstall', app.manifest.manifestURL);
    })
    .catch(function(err) {
      console.log(err);
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
      if (callback) callback(null, appId);
      return appId;
    });
}

if (require.main === module) {
  (function() {

    deployB2G('/Users/mozilla/Desktop/nicola/manifest.webapp', '/Users/mozilla/Desktop/nicola/app.zip', function(err, deploy){
      console.log("Connected and disconnected", deploy);
      
    }).done();

  })();
}