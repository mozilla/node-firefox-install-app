var Deploy = require('./index');
var Connect = require('fxos-connect');
var __ = require('underscore');

module.exports = DeployCommand;

function DeployCommand(opts, beforeCallback, afterCallback) {

  opts = opts || {};
  if (!beforeCallback) {
    beforeCallback = function (err, result, next) { next() }
  }

  opts.connect = true;
  Connect(opts, function(err, sim) {
    opts.client = sim.client;
    Deploy(opts, function(err, appId) {
      console.log("deploy")
      beforeCallback(err, {value:appId, client:opts.client}, function(err) {
        sim.client.disconnect();
        if (afterCallback) afterCallback(err, appId);
      });
    }).done();
  }).done()
}