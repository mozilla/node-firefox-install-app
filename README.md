# node-firefox-install-app [![Build Status](https://secure.travis-ci.org/mozilla/node-firefox-install-app.png?branch=master)](http://travis-ci.org/mozilla/node-firefox-install-app)

> Install an app on a runtime.

This is part of the [node-firefox](https://github.com/mozilla/node-firefox) project.

**NOTE**

*This is a work in progress. Things will probably be missing and broken while we move from `fxos-deploy` to `node-firefox-install-app`. Please have a look at the [existing issues](https://github.com/mozilla/node-firefox-install-app/issues), and/or [file more](https://github.com/mozilla/node-firefox-install-app/issues/new) if you find any! :-)*

## Installation

### From git

```bash
git clone https://github.com/mozilla/node-firefox-install-app.git
cd node-firefox-install-app
npm install
```

If you want to update later on:

```bash
cd node-firefox-install-app
git pull origin master
npm install
```

### npm

<!--
```bash
npm install node-firefox-install-app
```
-->

This module is not on npm yet.

## Usage

```javascript
installApp(options) // returns a Promise
```

where `options` is a plain `Object` which must contain the following:

* `manifest`: the manifest contents, in JSON format
* `client`: the remote client where we want to find if this app is installed

If no `options` are provided, or if `options` is an empty `Object` (`{}`), then `findApp` will fail (how can you find *you don't know what app exactly* in *you don't know where*?)


### Finding apps in simulators, using the manifest JSON contents

```javascript
var findApp = require('node-firefox-install-app');
var startSimulator = require('node-firefox-start-simulator');
var manifestJSON = loadJSON('manifest.webapp');

startSimulator().then(function(client) {

  findApp({
    manifest: manifestJSON,
    client: client
  }).then(function(apps) {
    if(apps.length === 0) {
      console.log('Not installed');
    }
  });

}, onError);


function onError(err) {
  console.error(err);
}

```

You can have a look at the `examples` folder for a complete example.

## Running the tests

After installing, you can simply run the following from the module folder:

```bash
npm test
```

To add a new unit test file, create a new file in the `tests/unit` folder. Any file that matches `test.*.js` will be run as a test by the appropriate test runner, based on the folder location.

We use `gulp` behind the scenes to run the test; if you don't have it installed globally you can use `npm gulp` from inside the project's root folder to run `gulp`.

### Code quality and style

Because we have multiple contributors working on our projects, we value consistent code styles. It makes it easier to read code written by many people! :-)

Our tests include unit tests as well as code quality ("linting") tests that make sure our test pass a style guide and [JSHint](http://jshint.com/). Instead of submitting code with the wrong indentation or a different style, run the tests and you will be told where your code quality/style differs from ours and instructions on how to fix it.

## History

This is based on initial work on [fxos-findapp](https://github.com/nicola/fxos-findapp) by Nicola Greco.

## License

This program is free software; it is distributed under an
[Apache License](https://github.com/mozilla/node-firefox-install-app/blob/master/LICENSE).

## Copyright

Copyright (c) 2015 [Mozilla](https://mozilla.org)
([Contributors](https://github.com/mozilla/node-firefox-install-app/graphs/contributors)).

