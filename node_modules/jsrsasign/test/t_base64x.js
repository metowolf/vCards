var assert = require('assert');
var rs = require('../lib/jsrsasign.js');

describe("base64x", function() {
  describe("hextorstr", function() {
    it('should return aaa', function() {
      assert.equal("aaa", rs.hextorstr("616161"));
    });
  });
});
