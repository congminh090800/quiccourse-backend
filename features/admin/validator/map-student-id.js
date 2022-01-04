const Joi = require("joi");

const schema = Joi.object().keys({
  id: Joi.string().required(),
  studentId: Joi.string().allow(null).allow("").optional(),
});

module.exports = schema;
