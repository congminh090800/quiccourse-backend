const Joi = require("joi");

const schema = Joi.object().keys({
  refreshToken: Joi.string().required(),
  userId: Joi.string().required(),
});

module.exports = schema;
