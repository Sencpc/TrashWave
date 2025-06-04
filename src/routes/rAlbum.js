const express = require("express");
const router = express.Router();

const {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  toggleLikeAlbum,
  getAlbumSongs,
  addSongToAlbum,
  removeSongFromAlbum,
  searchSpotifyAlbums,
  getSpotifyAlbum,
  getSpotifyAlbums,
} = require("../controller/cAlbum");

const { auth, admin, artist } = require("../Middleware/auth");
const { searchLimiter, uploadLimiter } = require("../Middleware/rateLimiter");
const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../Middleware/validation");
const {
  createAlbumSchema,
  updateAlbumSchema,
  searchSchema,
  paginationSchema,
} = require("../validation/schemas");

// Public routes
router.get("/", validateQuery(paginationSchema), getAllAlbums);
router.get(
  "/search/spotify",
  searchLimiter,
  validateQuery(searchSchema),
  searchSpotifyAlbums
);
router.get("/spotify/:albumId", getSpotifyAlbum);
router.get("/spotify/albums/:albumIds", getSpotifyAlbums);
router.get("/:id", getAlbumById);
router.get("/:id/songs", validateQuery(paginationSchema), getAlbumSongs);

// Authenticated routes
router.post("/:id/like", auth, toggleLikeAlbum);

// Artist/Admin routes
router.post("/", auth, artist, uploadLimiter, createAlbum);
router.put("/:id", auth, artist, uploadLimiter, updateAlbum);
router.delete("/:id", auth, artist, deleteAlbum);
router.post("/:id/songs/:songId", auth, artist, addSongToAlbum);
router.delete("/:id/songs/:songId", auth, artist, removeSongFromAlbum);

module.exports = router;
