const Joi = require("joi");

const schema = Joi.object().keys({
  name: Joi.string().allow(null).allow("").optional(),
  section: Joi.string().allow(null).allow("").optional(),
  owner: Joi.string().allow(null).allow("").max(100).optional(),
  code: Joi.string().min(5).max(7).optional(),
  offset: Joi.number().min(0).required(),
  limit: Joi.number().greater(0).max(50).required(),
});

module.exports = schema;
