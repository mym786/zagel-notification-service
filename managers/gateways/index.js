
module.exports.getGateway = function(type) {
    switch(type) {
        case "sms":
            return require('./sms-manager');
        case "email":
            return require('./email-manager');
        case "device":
            throw "Not Implemented Exception";
        default:
            throw "Not Supported Exception";

    }
}