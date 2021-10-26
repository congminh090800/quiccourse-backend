const joi = require("joi");

module.exports = function (schema, type) {
  return function (req, res, next) {
    type = type || "body"; // body or query
    const result = schema.validate(req[type]);

    if (result.error) {
      const err = {
        details: result.error.details,
      };

      return res.badRequest("MISSING_PARAMETERS", "MISSING_PARAMETERS", err);
    }

    next();
  };
};
