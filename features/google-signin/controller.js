const { Admin } = require("models");
const config = require("config");
const mongoose = require("mongoose");
const axios = require("axios");
const User = require("../../models/user");

module.exports = {
  googleSignIn: async (req, res, next) => {
    try {
      const { tokenId } = req.body;
      const response = await axios.get(
        `${config.google.authorizeUrl}tokeninfo`,
        {
          params: {
            id_token: tokenId,
          },
        }
      );
      const googleData = response.data;
      if (googleData["aud"] != config.google.authorizeKey) {
        return res.unauthorized("Wrong app", "Unauthorized");
      }
      const { email, picture, name, sub } = googleData;
      const existed = await User.findOne({ email: email, deleted_flag: false });
      if (!existed) {
        const newUser = await User({
          email: email,
          name: name,
          avatar: picture,
          googleId: sub,
          authenticationType: "google",
        });
        const saved = await newUser.save();
        return res.ok(saved);
      } else {
        if (sub != existed.googleId) {
          return res.badRequest(
            "Email has been registered as native account",
            "Bad request"
          );
        } else {
          return res.ok(existed);
        }
      }
    } catch (err) {
      return res.unauthorized(err, "Unauthorized");
    }
  },
};
