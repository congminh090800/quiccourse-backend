const Joi = require("joi");

const schema = Joi.object().keys({
  tokenId: Joi.string().required(),
});

module.exports = schema;
