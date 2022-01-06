const jwt = require("jsonwebtoken");
const config = require("config");
module.exports = async function (req, res, next) {
  let token = req.headers["authorization"];
  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  } else {
    return res.unauthorized("Bad Request", "Access token does not exist");
  }
  jwt.verify(token, config.secret.accessToken, (err, user) => {
    if (err) {
      return res.unauthorized(err.name, "Forbidden");
    } else {
      req.user = user;
      next();
    }
  });
};
