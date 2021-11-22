const Joi = require("joi");

const schema = Joi.object().keys({
    courseId: Joi.string().required(),
    userId: Joi.string().required(),
    studentId: Joi.string().required(),
});

module.exports = schema;