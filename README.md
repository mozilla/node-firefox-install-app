# moz-deploy-b2g

Deploy Firefox OS application to simulator

## Install

```
$ npm install moz-deploy-b2g
```

## Usage


### Start a simulator and deploy app (simple way)

Start a B2G and connect to it through [firefox-client](https://github.com/harthur/firefox-client) by returning `client`.

```javascript
var deployB2G = require('moz-deploy-b2g');

// Callback style
deployB2G('manifest.webapp', 'nicola.zip', function(err, appId){
  console.log("deployed:", appId);
})

// Promises style
deployB2G('manifest.webapp', 'nicola.zip')
  .then(function(appId){
    console.log("deployed:", appId);
  })
```

### Start a simulator and deploy app (with settings)

```javascript
var deployB2G = require('moz-deploy-b2g');

deployB2G({
  port:8002,
  zip: 'nicola.zip',
  manifestURL: 'manifest.webapp'
}, function(err, appId){
  console.log("deployed:", appId);
})
```

### Start a simulator and deploy app (with an existing opened connection)

```javascript
var deployB2G = require('moz-deploy-b2g');
var FirefoxClient = require("firefox-client");

var client = new FirefoxClient();

client.connect(1234, function(err) {
  deployB2G({
    zip: 'nicola.zip',
    manifestURL: 'manifest.webapp',
    client: client
  }, function(err, appId){
    console.log("deployed:", appId);
    client.disconnect();
  });
});
```
