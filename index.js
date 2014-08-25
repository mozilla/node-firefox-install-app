var startB2G = require('moz-start-b2g');
var findappB2G = require('moz-findapp-b2g');
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

  var webappsActor = Q.ninvoke(opts.client, 'getWebapps');
  var appActor = findappB2G(opts);
  var appId = uuid.v1();

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

  return Q()
    .then(uninstall)
    .then(install)
    .then(launch)
    .then(function() {
      if (callback) callback(null, appId);
      return appId;
    });
}

function deployB2G () {

  var args = arguments;
  var opts = {};
  var callback;

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


  // Missing manifest or zip
  if (!opts.manifestURL || !opts.zip) {
    throw new Error('No manifest or zip file');
  }

  return startB2G(opts)
    .then(function(client) {
      opts.client = opts.client || client;
    })
    .then(function() {
      return _deployB2G(opts, callback);
    });
}

if (require.main === module) {
  (function() {

    deployB2G('/Users/mozilla/Desktop/nicola/manifest.webapp', '/Users/mozilla/Desktop/nicola/app.zip', function(err, deploy){
      console.log("Connected and disconnected", deploy);
      
    }).done();

  })();
}