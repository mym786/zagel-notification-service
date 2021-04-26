const moment = require('moment');
const redis = require('redis');

// const redisClient = redis.createClient();
const redisClient = null;
const WINDOW_SIZE_IN_MINUTES = 1;
let MAX_WINDOW_REQUEST_COUNT = 5;
const WINDOW_LOG_INTERVAL_IN_MINUTES = 1;

/**
 * 
 * @param {*} options 
 */
module.exports.init = function (options) {
    MAX_WINDOW_REQUEST_COUNT = options.rateLimitPerMinute;
}

/**
 * The distributed version uses a sliding window algorithm. The basic idea behind is from the current timestamp,
 * go back and count the number of requests sent, if the requests are greater than allowed block the requests. 
 * 
 * Slidng window algorithm performs better than leaky algorithm in general and for the case for distributed where operation need to
 * be atomic
 * @param {*} userId 
 * @returns 
 */
module.exports.checkLimit = async function(userId) {
    try {
        // check that redis client exists
        if (!redisClient) {
          throw new Error('Redis client does not exist!');
          process.exit(1);
        }
        // fetch records of current user using IP address, returns null when no record is found
        redisClient.get(userId, function(err, record) {
          if (err) throw err;
          const currentRequestTime = moment();
          console.log(record);
          //  if no record is found , create a new record for user and store to redis
          if (record == null) {
            let newRecord = [];
            let requestLog = {
              requestTimeStamp: currentRequestTime.unix(),
              requestCount: 1
            };
            newRecord.push(requestLog);
            redisClient.set(userId, JSON.stringify(newRecord));
          }
          // if record is found, parse it's value and calculate number of requests users has made within the last window
          let data = JSON.parse(record);
          let windowStartTimestamp = moment()
            .subtract(WINDOW_SIZE_IN_MINUTES, 'minutes')
            .unix();
          let requestsWithinWindow = data.filter(entry => {
            return entry.requestTimeStamp > windowStartTimestamp;
          });
          console.log('requestsWithinWindow', requestsWithinWindow);
          let totalWindowRequestsCount = requestsWithinWindow.reduce((accumulator, entry) => {
            return accumulator + entry.requestCount;
          }, 0);
          // if number of requests made is greater than or equal to the desired maximum, return error
          if (totalWindowRequestsCount >= MAX_WINDOW_REQUEST_COUNT) {
            return false;
          } else {
            // if number of requests made is less than allowed maximum, log new entry
            let lastRequestLog = data[data.length - 1];
            let potentialCurrentWindowIntervalStartTimeStamp = currentRequestTime
              .subtract(WINDOW_LOG_INTERVAL_IN_MINUTES, 'minutes')
              .unix();
            //  if interval has not passed since last request log, increment counter
            if (lastRequestLog.requestTimeStamp > potentialCurrentWindowIntervalStartTimeStamp) {
              lastRequestLog.requestCount++;
              data[data.length - 1] = lastRequestLog;
            } else {
              //  if interval has passed, log new entry for current user and timestamp
              data.push({
                requestTimeStamp: currentRequestTime.unix(),
                requestCount: 1
              });
            }
            redisClient.set(userId, JSON.stringify(data));
          }
        });
      } catch (error) {
          console.log(error);
          return false;
      }
}