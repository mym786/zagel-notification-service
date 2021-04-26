const limiter = require('./../../../managers/rate-limit-manager/local-rate-limiter');
const chai = require('chai');
var assert = chai.assert;


describe('Local Rate Limiter Test', async function() {
    describe('#checkLimit', async function() {
        it('should return false when the number of requests is more than 5', async function() {
          limiter.init({
            rateLimitPerMinute: 5
          });
          await limiter.checkLimit(1);
          await limiter.checkLimit(1);
          await limiter.checkLimit(1);
          await limiter.checkLimit(1);
          await limiter.checkLimit(1);
          const res = await limiter.checkLimit(1);
          console.info(res);
          assert.equal(res, false);
        });

        it('should return false when the number of requests is less than 5', async function() {
            limiter.init({
              rateLimitPerMinute: 5
            });
            await limiter.checkLimit(1);
            await limiter.checkLimit(1);
            const res = await limiter.checkLimit(1);
            console.info(res);
            assert.equal(res, true);
          });
    });
});