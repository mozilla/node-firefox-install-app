'use strict';

var mockery = require('mockery');
var nodemock = require('nodemock');

var installApp = require('../../index');

module.exports = {

  'installApp() should yield an error when missing client option': function(test) {
    installApp({
      // Doesn't need to be a real path for this test, just not undefined
      appPath: 'abc123'
    }).then(function(results) {
      test.ok(false);
      test.done();
    }).catch(function(err) {
      test.done();
    });
  },

  'installApp() should yield an error when missing appPath option': function(test) {
    installApp({
      // Doesn't need to be a real client for this test, just not undefined
      client: { }
    }).then(function(results) {
      test.ok(false);
      test.done();
    }).catch(function(err) {
      test.done();
    });
  },

  'installApp() should package an application, install it, then delete the package': function(test) {

    // Establish some constants for expectations
    var APP_PATH = 'test/app/path';
    var APP_ID = 'test-app-id';
    var UUID = 'mock-uuid';
    var TMP_PATH = '/tmp/mock-path';
    var CALLBACK_TYPE = function() {};

    // Set up some mock methods with expectations to assert after installApp()
    var mocked = nodemock
      .mock('generateUuid').takes().returns(UUID)
      .mock('unlinkSync').takes(TMP_PATH)
      .mock('zipFolder')
        .takes(APP_PATH, TMP_PATH, CALLBACK_TYPE)
        .calls(2, [null])
      .mock('installPackaged')
        .takes(TMP_PATH, UUID, CALLBACK_TYPE)
        .calls(2, [null, APP_ID]);

    // Register mock methods as replacements for modules used by installApp()
    mockery.registerMock('fs', { unlinkSync: mocked.unlinkSync });
    mockery.registerMock('node-uuid', { v1: mocked.generateUuid });
    mockery.registerMock('zip-folder', mocked.zipFolder);

    // Replace `temporary` module with mock that yields a known tmp path
    mockery.registerMock('temporary', {
      File: function() {
        this.path = TMP_PATH;
      }
    });

    // Build a minimal mock firefox-client that calls installPackaged mock
    var mockClient = {
      getWebapps: function(webappsCallback) {
        webappsCallback(null, {
          installPackaged: mocked.installPackaged
        });
      }
    };

    // Enable mocks on a clear import cache
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });

    // Require a freshly imported installApp for this test
    require('../../index')({
      appPath: APP_PATH,
      client: mockClient
    }).then(function(result) {
      // Ensure all the mocks were called, and with the expected parameters
      test.ok(mocked.assert());
      test.equal(result, APP_ID, 'installApp() should have resulted in the ' +
                                 'mock app ID, rather than the UUID');
      test.done();
    }).catch(function(err) {
      test.ifError(err);
      test.done();
    });
  },

  tearDown: function(done) {
    // Clean up after mockery
    mockery.disable();
    done();
  }

};
