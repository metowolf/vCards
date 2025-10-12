var assert = require('assert');
var rs = require('../lib/jsrsasign.js');

// z1.pkcs1.pem
var _Z1PKCS1PEM = (function() {/*
-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQDRhGF7X4A0ZVlEg594WmODVVUIiiPQs04aLmvfg8SborHss5gQ
Xu0aIdUT6nb5rTh5hD2yfpF2WIW6M8z0WxRhwicgXwi80H1aLPf6lEPPLvN29EhQ
NjBpkFkAJUbS8uuhJEeKw0cE49g80eBBF4BCqSL6PFQbP9/rByxdxEoAIQIDAQAB
AoGAA9/q3Zk6ib2GFRpKDLO/O2KMnAfR+b4XJ6zMGeoZ7Lbpi3MW0Nawk9ckVaX0
ZVGqxbSIX5Cvp/yjHHpww+QbUFrw/gCjLiiYjM9E8C3uAF5AKJ0r4GBPl4u8K4bp
bXeSxSB60/wPQFiQAJVcA5xhZVzqNuF3EjuKdHsw+dk+dPECQQDubX/lVGFgD/xY
uchz56Yc7VHX+58BUkNSewSzwJRbcueqknXRWwj97SXqpnYfKqZq78dnEF10SWsr
/NMKi+7XAkEA4PVqDv/OZAbWr4syXZNv/Mpl4r5suzYMMUD9U8B2JIRnrhmGZPzL
x23N9J4hEJ+Xh8tSKVc80jOkrvGlSv+BxwJAaTOtjA3YTV+gU7Hdza53sCnSw/8F
YLrgc6NOJtYhX9xqdevbyn1lkU0zPr8mPYg/F84m6MXixm2iuSz8HZoyzwJARi2p
aYZ5/5B2lwroqnKdZBJMGKFpUDn7Mb5hiSgocxnvMkv6NjT66Xsi3iYakJII9q8C
Ma1qZvT/cigmdbAh7wJAQNXyoizuGEltiSaBXx4H29EdXNYWDJ9SS5f070BRbAIl
dqRh3rcNvpY6BKJqFapda1DjdcncZECMizT/GMrc1w==
-----END RSA PRIVATE KEY-----
*/}).toString().match(/\/\*([^]*)\*\//)[1];

var _hSigAAA = "6f7df91d8f973a0619d525c319337741130b77b21f9667dc7d1d74853b644cbe5e6b0e84aacc2faee883d43affb811fc653b67c38203d4f206d1b838c4714b6b2cf17cd621303c21bac96090df3883e58784a0576e501c10cdefb12b6bf887e548f6b07b09ae80d8416151d7dab7066d645e2eee57ac5f7af2a70ee0724c8e47";

describe("rsasign", function() {
  describe("z1.pkcs1.pem", function() {
    var prv = new rs.RSAKey();
    prv.readPKCS5PrvKeyHex(rs.pemtohex(_Z1PKCS1PEM));
    it('load and sign properly', function() {
      assert.equal(1024, prv.n.bitLength());
      assert.equal(_hSigAAA, prv.sign("aaa", "sha1"));
    });
  });
});
