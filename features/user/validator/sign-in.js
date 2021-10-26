const Joi = require("joi");

const schema = Joi.object().keys({
  email: Joi.string().email().min(13).required(),
  password: Joi.string()
    .regex(/^[a-zA-Z0-9!@#$%^&*()-_=+]{6,30}$/)
    .required(),
});

module.exports = schema;
