const Joi = require("joi");

const schema = Joi.object().keys({
    courseId: Joi.string().required(),
    gradeId: Joi.string().required()
});

module.exports = schema;