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
} = require("../controller/cPlaylist");

const { auth, admin } = require("../Middleware/auth");

// Public routes
router.get("/", getAllPlaylist);
router.get("/:id", getPlaylistById);

// Authenticated routes
router.post("/", auth, createPlaylist);
router.put("/:id", auth, updatePlaylist);
router.delete("/:id", auth, deletePlaylist);
router.post("/:id/like", auth, toggleLikePlaylist);
router.post("/:id/songs", auth, addSongToPlaylist);
router.delete("/:id/songs/:songId", auth, removeSongFromPlaylist);

module.exports = router;
