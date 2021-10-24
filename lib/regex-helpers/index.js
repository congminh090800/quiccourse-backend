const RandExp = require('randexp');

// export function validateEmail(email) {
//     const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//     return re.test(String(email).toLowerCase());
// }

function validatePhone(phone) {
    const re = /^[0-9]{10,11}$/;
    return re.test(String(phone).toLowerCase());
}

function validateRoomCode(code) {
    const re = /([a-zA-Z0-9]){5,7}/;
    return re.test(String(code).toLowerCase());
}

function generateRoomCode() {
    return new RandExp(/([a-zA-Z0-9]){5,7}/).gen();
}

module.exports = {
    validatePhone,
    validateRoomCode,
    generateRoomCode,
}

