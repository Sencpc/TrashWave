const Joi = require("joi");

// User/Account validation schemas
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
  username: Joi.string().alphanum().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string()
    .pattern(/^[0-9+\-\s]+$/)
    .optional(),
  birth_date: Joi.date().max("now").optional(),
  gender: Joi.string().valid("male", "female", "other").optional(),
  bio: Joi.string().max(500).optional(),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required(),
});

// Artist validation schemas
const artistRegistrationSchema = Joi.object({
  stage_name: Joi.string().min(2).max(100).required(),
  real_name: Joi.string().min(2).max(100).optional(),
  bio: Joi.string().max(1000).optional(),
  genre: Joi.string().max(100).optional(),
  country: Joi.string().max(100).optional(),
  social_links: Joi.object().optional(),
});

const updateArtistSchema = Joi.object({
  stage_name: Joi.string().min(2).max(100).optional(),
  real_name: Joi.string().min(2).max(100).optional(),
  bio: Joi.string().max(1000).optional(),
  genre: Joi.string().max(100).optional(),
  country: Joi.string().max(100).optional(),
  social_links: Joi.object().optional(),
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
  song_id: Joi.number().integer().required(),
});

// Search and filter schemas
const searchSchema = Joi.object({
  q: Joi.string().min(1).max(100).required(),
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

module.exports = {
  // Auth schemas
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,

  // Artist schemas
  artistRegistrationSchema,
  updateArtistSchema,

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
};
