const Joi = require("joi");

const schema = Joi.object().keys({
  courseId: Joi.string().required(),
  fullName: Joi.string().min(3).required(),
  studentId: Joi.string().required(),
});

module.exports = schema;
