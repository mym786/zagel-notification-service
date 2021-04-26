// The rate is 5 per minute
const MAX_ALLOWED_LIMIT = process.env.MAX_ALLOWED_LIMIT || 5; // TODO: Move to env file
const RATE_LIMIT_STRATEGY = process.env.RATE_LIMIT_STRATEGY || "local";

// lib
const local = require('./local-rate-limiter');
const dist = require('./distributed-rate-limiter');

/**
 * @param {*} userId 
 */
var limitter = null;
module.exports.checkLimit = async function(userId) {

    return await limitter.checkLimit(userId);


}

module.exports.init = function () {
    if (RATE_LIMIT_STRATEGY == "local") {
        limitter = local;
        limitter.init({
            rateLimitPerMinute: MAX_ALLOWED_LIMIT
        })
    } else if (RATE_LIMIT_STRATEGY == "distributed") {
        limitter = dist;
        limitter.init({
            rateLimitPerMinute: MAX_ALLOWED_LIMIT
        })
    }
}