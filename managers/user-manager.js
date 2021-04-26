
/* TODO: This is implemented as dummy service. 
   In an actual system, it's call the user service or in the case of monolith the userDAO/db
   to fetch the user information.
*/
module.exports.getUserById = async (userId) => {
    return {
        userId: "abc123",
        name: "Murtaza",
        mobileNo: "0100000000",
        email: "xyz@gmail.com",
        devices: [
            "apple", "google"
        ]
    }
}

module.exports.getUserPreferences = async (userId) => {
    return {
        PROMOTIONAL: {
            email: true,
            device: false,
            sms: false,
        },
        TRANSACTIONAL: {
            email: true,
            device: true,
            sms: true,
        },
        OTP: {
            email: false,
            device: false,
            sms: true
        }
    }
}