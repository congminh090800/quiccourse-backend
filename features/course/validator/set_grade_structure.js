const Joi = require("joi");

const schema = Joi.object().keys({
    courseId: Joi.string().required(),
    gradeStructure: Joi.array().items(Joi.object({
        name: Joi.string().required(),
        point: Joi.number().required(),
        index: Joi.number().optional(),
        createdAt: Joi.date().optional(),
    })).required()
});

module.exports = schema;