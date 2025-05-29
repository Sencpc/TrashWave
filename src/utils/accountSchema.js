// install joi: npm i joi @joi/date

const Joi = require("joi");

const accountSchema = Joi.object({
  username: Joi.string().min(1).max(100).required().label("Username").messages({
    "any.required": "{{#label}} is required",
    "string.min": "{{#label}} must be at least 1 character long",
    "string.max": "{{#label}} must not exceed 100 characters",
  }),

  email: Joi.string()
    .email({ tlds: { allow: ["com"] } })
    .required()
    .label("Email")
    .messages({
      "any.required": "{{#label}} is required",
      "string.email": "{{#label}} must be a valid email address",
    }),

  password: Joi.string()
    .min(6)
    .required()
    .label("Password")
    .messages({
      "string.min": "{{#label}} must be at least 6 characters long",
      "any.required": "{{#label}} is required",
    }),

  confirm_password: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Password Confirmation")
    .messages({ "any.only": "{{#label}} is incorrect" }),

  full_name: Joi.string().min(1).max(100).required().label("Nama Lengkap").messages({
    "any.required": "{{#label}} is required",
    "string.min": "{{#label}} must be at least 1 character long",
    "string.max": "{{#label}} must not exceed 100 characters",
  }),

  date_of_birth: Joi.date()
    .greater("1970-01-01")
    .less("now")
    .iso()
    .label("Date of Birth")
    .messages({
      "date.greater": "{{#label}} must be after 1970-01-01",
      "date.less": "{{#label}} must be before today",
      "date.format": "{{#label}} must be in ISO format (YYYY-MM-DD)",
    }),

  country: Joi.string().max(50).label("Country").allow(null, ""),
});

module.exports = accountSchema;
