
// The leaky bucket
var leaky = {};
var interval;

var rateLimitPerMinute = 0;
/**
 * Rate Limiting Implements a leaky bucket algorithm.. Every request for the user gets added to the bucket, and the bucket is leaked
 * based on allowed limit per minute. The function return true if the bucket is not full, else the bucket return false
 * @param {*} userId 
 * @param {*} rateLimitPerMinute 
 * @returns 
 */
module.exports.checkLimit = async function checkLimit(userId) {
    if (leaky[userId] == NaN || leaky[userId] == undefined)  {
        leaky[userId] = 1;
    } else if (leaky[userId] >= rateLimitPerMinute) {
        return false;
    }  else {
        leaky[userId] = leaky[userId] + 1;
    }
    return true;
}

module.exports.init = function init(options) {
    rateLimitPerMinute = options.rateLimitPerMinute;
    leaky = {};
    interval = setInterval(() => {
        const keys = Object.keys(leaky);
        for (var i = 0; i < keys.length; i++) {
            leaky[i] = 0;
        }

    }, 60 * 1000);
}

module.exports.shutdown = function shutdown() {
    clearInterval(interval);
}