// imports 
const assert = require('assert');
const { uuid } = require('uuidv4');

// constants 
const constants = require('./../constants');

// libs
const userManager = require('./user-manager');
const notifier = require('./notification-producer');
const limitter= require('./rate-limit-manager/rate-limit-manager');
const gateway = require('./gateways');

// init
limitter.init();

/**
 * The function is called by the API layer for notification
 * @param {*} ctx 
 * @param {*} userId 
 * @param {*} message 
 */

module.exports.notify = async (ctx, userId, message) => {
    // validate
    validate(ctx, message);
    
    // generate a unique id for the message, it will be used for message correlation & tracking
    message.id = uuid() // generate uuid

    const userManagerPrefs = await userManager.getUserPreferences(userId);

    switch(message.type) {
        case constants.MESSAGE_TYPES.PROMOTIONAL:
            if (await limitter.checkLimit(userId)) 
            await send(userId, message, userManagerPrefs, constants.MESSAGE_TYPES.PROMOTIONAL);
            else throw "Rate Exceeded"
            break;
        case constants.MESSAGE_TYPES.TRANSACTIONAL:
            await send(userId, message, userManagerPrefs, constants.MESSAGE_TYPES.TRANSACTIONAL);
            break;
        case constants.MESSAGE_TYPES.OTP:
            await send(userId, message, userManagerPrefs, constants.MESSAGE_TYPES.OTP);
            break;
        
    }
}

module.exports.listen = async (topic, message) => {
    let userId = message.userId;
    let msg = message.message;

    switch(topic) {
        case constants.TOPIC_EMAIL:
            gateway.getGateway("email").send(userId, msg);
            break;
        case constants.TOPIC_SMS:
            gateway.getGateway("sms").send(userId, msg);
            break;
        case constants.TOPIC_DEVICE:
            gateway.getGateway("device").send(userId, msg);
            break;

    }
}

function validate(ctx, message) {
    console.log(JSON.stringify(message));
    assert(message.type != undefined, "Notification type is not missing"); // TODO: Message should be localized in the bundle
    assert(message.message, "Notification Message is missing"); 
}

/**
 * The function is responsible for scheduling the notification, it will be the responsibility of the consumer to fetch the (mobile or email, etc..) and
 * send it to the customer. Say for example the user has new device Windows, it will be the responsibility of another service
 * 
 * @param {*} userId 
 * @param {*} message 
 * @param {*} notificationPrefs 
 * @param {*} type 
 */
async function send(userId, message, notificationPrefs, type) {
    const prefs = notificationPrefs[type];
    if (prefs.email) notifier.send(userId, message.message, constants.TOPIC_EMAIL);
    if (prefs.sms) notifier.send(userId, message.message, constants.TOPIC_SMS);
    if (prefs.device) notifier.send(userId, message.message, constants.TOPIC_DEVICE);
}