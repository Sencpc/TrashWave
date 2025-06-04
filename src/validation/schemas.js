const Joi = require("joi");

// User/Account validation schemas
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

  password: Joi.string().min(6).required().label("Password").messages({
    "string.min": "{{#label}} must be at least 6 characters long",
    "any.required": "{{#label}} is required",
  }),

  confirm_password: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Password Confirmation")
    .messages({ "any.only": "{{#label}} is incorrect" }),

  full_name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .label("Nama Lengkap")
    .messages({
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
  gender: Joi.string()
    .valid("male", "female", "other")
    .required()
    .label("Gender"),
});

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s]+$/)
    .optional(),
  birth_date: Joi.date().max("now").optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
  username: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  full_name: Joi.string().min(1).max(100).optional(),
  date_of_birth: Joi.date().greater("1970-01-01").less("now").iso().optional(),
  country: Joi.string().max(50).optional().allow(null, ""),
  gender: Joi.string().valid("male", "female", "other").optional(),
  password: Joi.string().min(6).optional(),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s]+$/)
    .optional(),
  bio: Joi.string().max(500).optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

const updateArtistSchema = Joi.object({
  stage_name: Joi.string().min(2).max(100).optional(),
  real_name: Joi.string().min(2).max(100).optional(),
  bio: Joi.string().max(1000).optional(),
  genre: Joi.string().max(100).optional(),
  country: Joi.string().max(100).optional(),
  social_links: Joi.object().optional(),
});

const registerArtistSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  name: Joi.string().min(2).max(100).required(),
  real_name: Joi.string().min(2).max(100).optional().allow(null, ""),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  dob: Joi.date().iso().optional().allow(null, ""),
  country: Joi.string().max(100).optional().allow(null, ""),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s]+$/)
    .optional()
    .allow(null, ""),
  bio: Joi.string().max(1000).optional().allow(null, ""),
  gender: Joi.string()
    .valid("male", "female", "other")
    .optional()
    .allow(null, ""),
  genres: Joi.alternatives()
    .try(Joi.array().items(Joi.string().max(100)), Joi.string())
    .optional()
    .allow(null, ""),
  social_links: Joi.alternatives()
    .try(Joi.object(), Joi.string())
    .optional()
    .allow(null, ""),
});

// Song validation schemas
const createSongSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  duration: Joi.number().integer().min(1).optional(),
  genre: Joi.string().max(100).optional(),
  release_date: Joi.date().max("now").optional(),
  lyrics: Joi.string().optional(),
  album_id: Joi.number().integer().optional(),
  spotify_id: Joi.string().optional(),
  explicit_content: Joi.boolean().optional(),
});

const updateSongSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  duration: Joi.number().integer().min(1).optional(),
  genre: Joi.string().max(100).optional(),
  release_date: Joi.date().max("now").optional(),
  lyrics: Joi.string().optional(),
  album_id: Joi.number().integer().optional(),
  explicit_content: Joi.boolean().optional(),
});

// Album validation schemas
const createAlbumSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
  release_date: Joi.date().max("now").optional(),
  genre: Joi.string().max(100).optional(),
  total_tracks: Joi.number().integer().min(0).optional(),
  spotify_id: Joi.string().optional(),
});

const updateAlbumSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  release_date: Joi.date().max("now").optional(),
  genre: Joi.string().max(100).optional(),
  total_tracks: Joi.number().integer().min(0).optional(),
});

// Playlist validation schemas
const createPlaylistSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
  is_public: Joi.boolean().optional(),
});

const updatePlaylistSchema = Joi.object({
  name: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  is_public: Joi.boolean().optional(),
});

const addSongToPlaylistSchema = Joi.object({
  song_name: Joi.string().required(),
  postition: Joi.number().integer().min(1).optional(),
});

// Search and filter schemas
const searchSchema = Joi.object({
  query: Joi.string().min(1).max(100).required(),
  type: Joi.string()
    .valid("song", "artist", "album", "playlist", "all")
    .optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
  offset: Joi.number().integer().min(0).optional(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  sort: Joi.string()
    .valid(
      "created_at",
      "updated_at",
      "title",
      "name",
      "play_count",
      "like_count"
    )
    .optional(),
  order: Joi.string().valid("ASC", "DESC").optional(),
});

// Payment and subscription schemas
const subscriptionSchema = Joi.object({
  plan_id: Joi.number().integer().required(),
  payment_method: Joi.string()
    .valid("credit_card", "paypal", "bank_transfer")
    .required(),
});

const paymentSchema = Joi.object({
  amount: Joi.number().precision(2).min(0).required(),
  payment_method: Joi.string()
    .valid("credit_card", "paypal", "bank_transfer")
    .required(),
  payment_details: Joi.object().required(),
});

const subscribeSchema = Joi.object({
  api_level: Joi.string().valid("free", "premium_lite", "premium").required(),
});

// Ad validation schemas
const createAdSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid("audio", "video", "image").required(),
  target_audience: Joi.object().optional(),
  budget: Joi.number().precision(2).min(0).optional(),
  duration: Joi.number().integer().min(1).optional(),
  click_url: Joi.string().uri().optional(),
});

const updateAdSchema = Joi.object({
  title: Joi.string().min(1).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid("audio", "video", "image").optional(),
  target_audience: Joi.object().optional(),
  budget: Joi.number().precision(2).min(0).optional(),
  duration: Joi.number().integer().min(1).optional(),
  click_url: Joi.string().uri().optional(),
});

// Admin validation schemas
const createSubscriptionPlanSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().precision(2).min(0).required(),
  duration_days: Joi.number().integer().min(1).required(),
  features: Joi.object().required(),
  is_active: Joi.boolean().optional(),
});

const updateSubscriptionPlanSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  price: Joi.number().precision(2).min(0).optional(),
  duration_days: Joi.number().integer().min(1).optional(),
  features: Joi.object().optional(),
  is_active: Joi.boolean().optional(),
});

const createAdminSchema = Joi.object({
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
  password: Joi.string().min(6).required().label("Password").messages({
    "string.min": "{{#label}} must be at least 6 characters long",
    "any.required": "{{#label}} is required",
  }),
  full_name: Joi.string()
    .min(1)
    .max(100)
    .required()
    .label("Full Name")
    .messages({
      "any.required": "{{#label}} is required",
      "string.min": "{{#label}} must be at least 1 character long",
      "string.max": "{{#label}} must not exceed 100 characters",
    }),
  date_of_birth: Joi.date()
    .greater("1970-01-01")
    .less("now")
    .iso()
    .optional()
    .label("Date of Birth")
    .messages({
      "date.greater": "{{#label}} must be after 1970-01-01",
      "date.less": "{{#label}} must be before today",
      "date.format": "{{#label}} must be in ISO format (YYYY-MM-DD)",
    }),
  country: Joi.string().max(100).optional().label("Country"),
  gender: Joi.string()
    .valid("male", "female", "other")
    .optional()
    .label("Gender"),
});

module.exports = {
  // Auth schemas
  accountSchema,
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,

  // Artist schemas
  updateArtistSchema,
  registerArtistSchema,

  // Song schemas
  createSongSchema,
  updateSongSchema,

  // Album schemas
  createAlbumSchema,
  updateAlbumSchema,

  // Playlist schemas
  createPlaylistSchema,
  updatePlaylistSchema,
  addSongToPlaylistSchema,

  // Search and pagination
  searchSchema,
  paginationSchema,
  // Payment schemas
  subscriptionSchema,
  paymentSchema,
  subscribeSchema,
  // Ad schemas
  createAdSchema,
  updateAdSchema,
  // Admin schemas
  createAdminSchema,
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
};
