const Joi = require("joi");

const schema = Joi.object().keys({
    courseId: Joi.string().required(),
    gradeId: Joi.string().required(),
    name: Joi.string().required(),
    point: Joi.number().required(),
});

module.exports = schema;