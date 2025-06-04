const express = require("express");
const router = express.Router();

const {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  toggleLikeSong,
  playSong,
  downloadSong,
  searchSpotify,
  getSpotifyTrack,
  getSpotifyTracks,
} = require("../controller/cSong");

const { auth, admin, artist } = require("../Middleware/auth");
const { searchLimiter, uploadLimiter } = require("../Middleware/rateLimiter");

// Public routes
router.get("/", getAllSongs);
router.get("/search/spotify", searchLimiter, searchSpotify);
router.get("/spotify/:trackId", getSpotifyTrack);
router.get("/spotify/tracks/:trackIds", getSpotifyTracks);
router.get("/:id", getSongById);

// Authenticated routes
router.post("/:id/like", auth, toggleLikeSong);
router.post("/:id/play", auth, playSong);
router.post("/:id/download", auth, downloadSong);

// Artist/Admin routes
router.post("/", auth, artist, uploadLimiter, createSong);
router.put("/:id", auth, artist, uploadLimiter, updateSong);
router.delete("/:id", auth, artist, deleteSong);

module.exports = router;
