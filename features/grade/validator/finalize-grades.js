const Joi = require("joi");

const schema = Joi.object().keys({
  courseId: Joi.string().required(),
  gradeComponentId: Joi.string().required(),
  listPoints: Joi.array().items({
    studentId: Joi.string().required(),
    point: Joi.number().min(0).required()
  }).min(0).required(),
});

module.exports = schema;
