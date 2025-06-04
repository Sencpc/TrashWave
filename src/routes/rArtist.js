const express = require("express");
const router = express.Router();

const {
  getAllArtists,
  getArtistByName,
  registerArtist,
  updateArtist,
  banArtist,
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
router.get("/:name", getArtistByName);
router.get("/:name/songs", getArtistSongs);
router.get("/:name/albums", getArtistAlbums);
router.post("/register", registerArtist);
router.post("/:name/follow", auth, toggleFollowArtist);
router.put("/:name", auth, artist, updateArtist);

// Admin only routes
router.delete("/:name", auth, admin, banArtist);
router.put("/:name/verify", auth, admin, verifyArtist);

module.exports = router;
