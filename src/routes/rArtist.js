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
<<<<<<< HEAD
router.get("/:name", getArtistByName);
router.get("/:name/songs", getArtistSongs);
router.get("/:name/albums", getArtistAlbums);
=======
router.get("/search/spotify", searchSpotifyArtists);
router.get("/spotify/:artistId", getSpotifyArtist);
router.get("/spotify/artists/:artistIds", getSpotifyArtists);
router.get("/:id", getArtistById);
router.get("/:id/songs", getArtistSongs);
router.get("/:id/albums", getArtistAlbums);
>>>>>>> 2a500904658d5bf5868d80c8ba652cc56efb9e59
router.post("/register", registerArtist);

// Authenticated routes
router.post("/:name/follow", auth, toggleFollowArtist);

// Artist/Admin routes
router.put("/:name", auth, artist, updateArtist);

// Admin only routes
router.delete("/:name", auth, admin, banArtist);
router.put("/:name/verify", auth, admin, verifyArtist);

module.exports = router;
