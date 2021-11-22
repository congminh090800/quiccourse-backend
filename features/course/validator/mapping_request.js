const Joi = require("joi");

const schema = Joi.object().keys({
    courseId: Joi.string().required(),
    studentId: Joi.string().required(),
    message: Joi.string().required(),
});

module.exports = schema;