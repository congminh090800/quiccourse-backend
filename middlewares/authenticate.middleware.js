const jwt = require('jsonwebtoken');
const config = require('config');
module.exports = function (req, res, next) {
    let token = req.headers["authorization"];
    if (token && token.startsWith("Bearer ")) {
        token = token.split(" ")[1];
    }
    else {
        return res.badRequest("Bad Request", "Access token does not exist");
    }
  
    jwt.verify(token, config.secret.accessToken, (err, user) => {
        if (err) {
            return res.forbidden("Forbidden", "Token is not verified");
        } else {
            req.user = user;
            next();
        }
    });
}