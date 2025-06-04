const express = require("express");
const router = express.Router();

const {
  getAllPlaylist,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  toggleLikePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  searchSpotifyPlaylists,
  getSpotifyPlaylist,
  searchSpotifyMultiple,
} = require("../controller/cPlaylist");

const { auth } = require("../Middleware/auth");
const { searchLimiter, uploadLimiter } = require("../Middleware/rateLimiter");
const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../Middleware/validation");
const {
  createPlaylistSchema,
  updatePlaylistSchema,
  addSongToPlaylistSchema,
  searchSchema,
  paginationSchema,
} = require("../validation/schemas");

// Public routes
router.get("/", validateQuery(paginationSchema), getAllPlaylist);
router.get(
  "/search/spotify",
  searchLimiter,
  validateQuery(searchSchema),
  searchSpotifyPlaylists
);
router.get(
  "/search/spotify/multiple",
  searchLimiter,
  validateQuery(searchSchema),
  searchSpotifyMultiple
);
router.get("/spotify/:playlistId", getSpotifyPlaylist);
router.get("/:id", getPlaylistById);

// Authenticated routes
router.post("/", auth, uploadLimiter, createPlaylist);
router.put("/:id", auth, uploadLimiter, updatePlaylist);
router.delete("/:id", auth, deletePlaylist);
router.post("/:id/like", auth, toggleLikePlaylist);
router.post(
  "/:id/songs",
  auth,
  validateBody(addSongToPlaylistSchema),
  addSongToPlaylist
);
router.delete("/:id/songs/:songId", auth, removeSongFromPlaylist);

module.exports = router;
