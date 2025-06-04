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

    req[property] = value;
    next();
  };
};

// Special validation for multipart/form-data (file uploads)
const validateMultipart = (schema) => {
  return (req, res, next) => {
    // For multipart requests, the text fields are in req.body
    // Files are handled separately by multer middleware
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true, // Allow file fields that aren't in the schema
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

    // Update req.body with validated and sanitized data
    req.body = { ...req.body, ...value };
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
  validateMultipart,
};
