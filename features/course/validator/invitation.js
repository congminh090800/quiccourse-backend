const Joi = require("joi");

const schema = Joi.object().keys({
    courseCode: Joi.string().min(5).max(7).required()
});

module.exports = schema;