#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var Q = require('q');
var deploy = require('../command');

var opts = require("nomnom")
  .option('manifestURL', {
    position: 0,
    help: "App manifest.webapp to deploy",
    list: false
  })
  .option('zip', {
    help: 'Zip file containing the app'
  })
  .option('port', {
    abbr: 'p',
    help: 'Port of FirefoxOS'
  })
    .option('port', {
    abbr: 'p',
    help: 'Port of FirefoxOS'
  })
  .option('force', {
    abbr: 'f',
    help: 'Kill other simulators on this port',
    flag: true
  })
  .option('verbose', {
    help: 'Set the output level to verbose',
    flag: true
  })
  .option('bin', {
    help: 'Set external B2G bin',
  })
  .option('profile', {
    help: 'Set external B2G profile',
  })
  .option('release', {
    list: true,
    help: 'Release of FirefoxOS to filter',
    metavar: '<release>',
    type: 'string'
  })
  .option('exit', {
    help: 'Exit after startup',
    flag: true
  })
  .option('stdin', {
    help: 'The path where stdin of the simulator will be redirected to',
    metavar: '<stdin filepath>'
  })
  .option('stdout', {
    help: 'The path where stdout of the simulator will be redirected to',
    metavar: '<stdout filepath>'
  })
  .option('stderr', {
    help: 'The path where stderr of the simulator will be redirected to',
    metavar: '<stderr filepath>'
  })
  .option('version', {
    flag: true,
    help: 'Print version and exit',
    callback: function() {
      fs.readFile(path.resolve(__dirname, '../package.json'), 'utf-8', function(err, file) {
        console.log(JSON.parse(file).version);
      });
    }
  })
  .parse();

if (!opts.manifestURL) {
  opts.manifestURL = path.resolve('./manifest.webapp');
}

deploy(opts, function(err, result, done) {
  console.log("App installed with UUID:", result.value);
  done();
});