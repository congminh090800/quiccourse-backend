const Joi = require("joi");

const schema = Joi.object().keys({
  phone: Joi.string()
    .regex(/^[0-9]{10,11}$/)
    .required(),
  name: Joi.string().min(6).max(100).required(),
  birthDate: Joi.date().iso().required(),
  gender: Joi.string().valid("male", "female").required(),
});

module.exports = schema;
