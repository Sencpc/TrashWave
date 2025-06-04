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

const { auth, admin } = require("../Middleware/auth");
const { searchLimiter, uploadLimiter } = require("../Middleware/rateLimiter");

// Public routes
router.get("/", getAllPlaylist);
router.get("/search/spotify", searchLimiter, searchSpotifyPlaylists);
router.get("/search/spotify/multiple", searchLimiter, searchSpotifyMultiple);
router.get("/spotify/:playlistId", getSpotifyPlaylist);
router.get("/:id", getPlaylistById);

// Authenticated routes
router.post("/", auth, uploadLimiter, createPlaylist);
router.put("/:id", auth, uploadLimiter, updatePlaylist);
router.delete("/:id", auth, deletePlaylist);
router.post("/:id/like", auth, toggleLikePlaylist);
router.post("/:id/songs", auth, addSongToPlaylist);
router.delete("/:id/songs/:songId", auth, removeSongFromPlaylist);

module.exports = router;
