const Joi = require("joi");

const schema = Joi.object().keys({
    studentId: Joi.string().min(6).regex(/^\d+$/).required(),
});

module.exports = schema;