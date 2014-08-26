# fxos-deploy

Deploy Firefox OS application to simulator

## Install

```
$ npm install fxos-deploy
```

## Usage


### Start a simulator and deploy app (simple way)

Start a FirefoxOS simulator and connect to it through [firefox-client](https://github.com/harthur/firefox-client) by returning `client`.

```javascript
var deploy = require('fxos-deploy');

// Callback style
deploy('manifest.webapp', 'nicola.zip', function(err, appId){
  console.log("deployed:", appId);
})

// Promises style
deploy('manifest.webapp', 'nicola.zip')
  .then(function(appId){
    console.log("deployed:", appId);
  })
```

### Start a simulator and deploy app (with settings)

```javascript
var deploy = require('fxos-deploy');

deploy({
  port:8002,
  zip: 'nicola.zip',
  manifestURL: 'manifest.webapp'
}, function(err, appId){
  console.log("deployed:", appId);
})
```

### Start a simulator and deploy app (with an existing opened connection)

```javascript
var deploy = require('fxos-deploy');
var FirefoxClient = require("firefox-client");

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
