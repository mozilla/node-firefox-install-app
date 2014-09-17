var Connect = require('fxos-connect');
var FindApp = require('fxos-findapp');
var FirefoxClient = require('firefox-client');
var fs = require('fs');
var Q = require('q');
var uuid = require('node-uuid');
var __ = require('underscore');
var path = require('path');

module.exports = deployB2G;

function deployB2G (opts, callback) {

  opts = opts ? __.clone(opts) : {};
  // Missing manifest or zip
  if (!opts.manifestURL || !opts.zip) {
    throw new Error('No manifest or zip file');
  }

  // Resolving paths
  opts.manifestURL = path.resolve(opts.manifestURL);
  opts.zip = path.resolve(opts.zip);

  // UUID of the app
  var appId = uuid.v1();
  var webappsActor = Q.ninvoke(opts.client, 'getWebapps');
  var appActor = FindApp(opts);

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

  return Q()
    .then(uninstall)
    .then(install)
    .then(launch)
    .then(function() {
      if (callback) callback(null, appId);
      return appId;
    });
}
