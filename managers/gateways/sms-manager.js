var userManagement = require('./../user-manager');
module.exports.send = async function (userId, message) {
    // fetch mobile no. from user management service 
    var user = await userManagement.getUserById(userId);
    
    // send the message
    console.log("Message has been sent to " + user.mobileNo + " " + message);
}