var assert = require("assert");
var should = require("should");
var Deploy = require("../");
var Ports = require("fx-ports");
var Q = require('q');


describe('fxos-deploy', function(){
  this.timeout(10000);
  afterEach(function() {
    Ports({b2g:true}, function(err, instances) {
      instances.forEach(function(i) {
        process.kill(i.pid);
      });
    });
  });

  describe('when no open simulator', function(){

    it('should return app id', function(done) {
      Deploy({
          manifestURL: './test/sampleapp/manifest.webapp',
          zip: './test/sampleapp/build/app.zip'
        })
        .then(function(sim) {
          sim.should.be.type('string');
        })
        .then(done)
        .fail(done);
    });

  });

});