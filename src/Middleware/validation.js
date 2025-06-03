const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    // Replace the request property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

const validateQuery = (schema) => validate(schema, "query");
const validateParams = (schema) => validate(schema, "params");
const validateBody = (schema) => validate(schema, "body");

module.exports = {
  validate,
  validateQuery,
  validateParams,
  validateBody,
};
