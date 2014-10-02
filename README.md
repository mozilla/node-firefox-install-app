# fxos-deploy

Deploy Firefox OS application to simulator

## Install

```bash
$ npm install fxos-deploy
# add -g for command-line
$ npm install -g fxos-deploy
```

## Usage

Start a FirefoxOS simulator and connect to it through [firefox-client](https://github.com/harthur/firefox-client) by returning `client`.

### Command line

![fxos-deploy](https://raw.githubusercontent.com/nicola/fxos-deploy/master/docs/fxos-deploy.gif)

### Node library

#### Callback

```javascript
// client from firefox-client or fxos-connect or fxos-start
var deploy = require('fxos-deploy');
/* ... */
deploy({
  manifestURL: 'manifest.webapp',
  zip:'nicola.zip',
  client: client
}, function(err, appId){
  console.log("deployed with ID:", appId);
})
```

#### Promise

```javascript
/* ... */
deploy({
    manifestURL: 'manifest.webapp',
    zip:'nicola.zip',
    client: sim.client
  })
  .then(function(appId) {})
  .fail(function(err) {})
```

#### Command

This handles connection and disconnection wrapping a callback in between

```javascript
var deploy = require('fxos-deploy/command');
deploy({
  port:8002,
  zip: 'nicola.zip',
  manifestURL: 'manifest.webapp'
}, function(err, result, next){
  // result = {
  //   client: FirefoxClient,
  //   result: appId
  // }
  next(err);
})
```

## Examples

#### Using firefox-client

```javascript
var FirefoxClient = require("firefox-client");
var deploy = require('fxos-deploy');
var client = new FirefoxClient();

client.connect(1234, function(err) {
  deploy({
    zip: 'nicola.zip',
    manifestURL: 'manifest.webapp',
    client: client
  }, function(err, appId){
    console.log("deployed:", appId);
    client.disconnect();
  });
});
```

#### Using fxos-start

```javascript
var start = require('fxos-start');
var deploy = require('fxos-deploy');

start(function(err, sim) {
  deploy({
    manifestURL: 'manifest.webapp',
    zip:'nicola.zip',
    client: sim.client
  }, function(err, appId){
    console.log("deployed with ID:", appId);
    sim.client.disconnect();
  })
})
```

#### Using fxos-connect

```javascript
var connect = require('fxos-connect');
var deploy = require('fxos-deploy');

connect().then(function(sim) {
  return deploy({
    manifestURL: 'manifest.webapp',
    zip:'nicola.zip',
    client: sim.client
  }).then(sim.client.disconnect);
});
```