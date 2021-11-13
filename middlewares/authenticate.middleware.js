const jwt = require("jsonwebtoken");
const config = require("config");
const axios = require("axios");
const User = require("../models/user");
module.exports = async function (req, res, next) {
  let type = req.headers["access-token-type"] || "native";
  let token = req.headers["authorization"];
  if (token && token.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  } else {
    return res.badRequest("Bad Request", "Access token does not exist");
  }
  if (type == "google") {
    try {
      const response = await axios.get(
        `${config.google.authorizeUrl}tokeninfo`,
        {
          params: {
            id_token: token,
          },
        }
      );
      const googleData = response.data;
      if (googleData["aud"] != config.google.authorizeKey) {
        throw "Wrong app";
      }
      let user = await User.findOne({
        googleId: googleData["sub"],
        deleted_flag: false,
      });
      if (!user) {
        return res.forbidden("user not exist", "Forbidden");
      }
      console.log(user.id);
      req.user = user;
      next();
    } catch (err) {
      return res.forbidden(err, "Forbidden");
    }
  } else {
    jwt.verify(token, config.secret.accessToken, (err, user) => {
      if (err) {
        return res.forbidden(err.name, "Forbidden");
      } else {
        req.user = user;
        next();
      }
    });
  }
};
