const Joi = require("joi");

const schema = Joi.object().keys({
  name: Joi.string().min(3).required(),
  section: Joi.string().min(3).optional(),
  subject: Joi.string().min(3).optional(),
  room: Joi.string().min(3).optional(),
  backgroundImg: Joi.string().optional().allow(null).allow(""),
  owner: Joi.string().required(),
  participants: Joi.array().items(Joi.string()).allow(null).optional(),
});

module.exports = schema;
