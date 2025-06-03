const express = require("express");
const router = express.Router();

const {
  getAllArtists,
  getArtistById,
  registerArtist,
  updateArtist,
  deleteArtist,
  toggleFollowArtist,
  getArtistSongs,
  getArtistAlbums,
  verifyArtist,
  searchSpotifyArtists,
  getSpotifyArtist,
  getSpotifyArtists,
} = require("../controller/cArtist");

const { auth, admin, artist } = require("../Middleware/auth");

// Public routes
router.get("/", getAllArtists);
router.get("/search/spotify", searchSpotifyArtists);
router.get("/spotify/:artistId", getSpotifyArtist);
router.get("/spotify/artists/:artistIds", getSpotifyArtists);
router.get("/:id", getArtistById);
router.get("/:id/songs", getArtistSongs);
router.get("/:id/albums", getArtistAlbums);
router.post("/register", registerArtist);

// Authenticated routes
router.post("/:id/follow", auth, toggleFollowArtist);

// Artist/Admin routes
router.put("/:id", auth, artist, updateArtist);

// Admin only routes
router.delete("/:id", auth, admin, deleteArtist);
router.put("/:id/verify", auth, admin, verifyArtist);

module.exports = router;
