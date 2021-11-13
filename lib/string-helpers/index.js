const generateRandomString = (length = 10) => {
    let result = '';
    for (let i = 0; i < length / 13; i++) {
        result += Math.random().toString(36).substr(2, length);
    }
    return result;
}

module.exports = {
    generateRandomString,
}