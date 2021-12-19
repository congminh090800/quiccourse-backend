const Joi = require("joi");

const schema = Joi.object().keys({
  notificationId: Joi.string().required(),
});

module.exports = schema;
