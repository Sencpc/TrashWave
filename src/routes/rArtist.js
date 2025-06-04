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
const { authLimiter, uploadLimiter } = require("../Middleware/rateLimiter");
const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../Middleware/validation");
const {
  registerArtistSchema,
  updateArtistSchema,
  paginationSchema,
} = require("../validation/schemas");

// Public routes
router.get("/", validateQuery(paginationSchema), getAllArtists);
router.get("/:name", getArtistByName);
router.get("/:name/songs", validateQuery(paginationSchema), getArtistSongs);
router.get("/:name/albums", validateQuery(paginationSchema), getArtistAlbums);
router.post("/register", authLimiter, registerArtist);
router.post("/:name/follow", auth, toggleFollowArtist);
router.put("/:name", auth, artist, uploadLimiter, updateArtist);

// Admin only routes
router.delete("/:name", auth, admin, banArtist);
router.put("/:name/verify", auth, admin, verifyArtist);

module.exports = router;
