const Joi = require("joi");

const schema = Joi.object().keys({
    courseId: Joi.string().required(),
    gradeStructure: Joi.array().items(Joi.object({
        gradeName: Joi.string().required(),
        gradePoint: Joi.number().required(),
    })).required()
});

module.exports = schema;