var Deploy = require('./index');
var Connect = require('fxos-connect');
var __ = require('underscore');

module.exports = DeployCommand;

function DeployCommand(opts, callback) {

  Connect(opts, function(sim) {
    opts.client = sim.client;
    Deploy(opts, function(err, appId) {
      opts.callback(err, appId, client, function(err) {
        sim.client.disconnect();
      });
    });
  })
}