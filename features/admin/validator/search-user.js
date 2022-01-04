const Joi = require("joi");

const schema = Joi.object().keys({
  name: Joi.string().allow(null).allow("").optional(),
  email: Joi.string().allow(null).allow("").optional(),
  timeOrder: Joi.bool().valid("ASC", "DESC").optional(),
  offset: Joi.number().min(0).optional(),
  limit: Joi.number().greater(0).max(100).optional(),
});

module.exports = schema;
