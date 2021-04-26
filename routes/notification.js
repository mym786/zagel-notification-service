const router = require('express').Router();
const constants = require('./../constants');

const notificationManager = require('./../managers/notification-manager');

router.post('/', async (req, res, next) => {
    const { userId, message } = req.body;
    const ctx = {
        userId: userId,
        locale: "en"
    }
    await notificationManager.notify(ctx, userId, message);
    res.json({
        userId : userId,
        message: "Message Recvd"
    })
    next();
});

module.exports= router;