const Joi = require("joi");

const schema = Joi.object().keys({
    emails: Joi.array().min(1).required(),
    courseId: Joi.string().required()
});

module.exports = schema;