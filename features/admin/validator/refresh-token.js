const Joi = require("joi");

const schema = Joi.object().keys({
  refreshToken: Joi.string().required(),
});

module.exports = schema;
