const Joi = require("joi");

const schema = Joi.object().keys({
  email: Joi.string().email().min(13).required(),
  password: Joi.string()
    .regex(/^[a-zA-Z0-9!@#$%^&*()-_=+]{6,30}$/)
    .required(),
  phone: Joi.string()
    .regex(/^[0-9]{10,11}$/)
    .required(),
  name: Joi.string().min(6).max(100).required(),
  birthDate: Joi.date().iso().allow(null).optional(),
  gender: Joi.string().valid("male", "female").optional(),
  avatar: Joi.string().optional(),
});

module.exports = schema;
