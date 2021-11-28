const Joi = require("joi");

const schema = Joi.object().keys({
    studentId: Joi.string().min(6).required(),
});

module.exports = schema;