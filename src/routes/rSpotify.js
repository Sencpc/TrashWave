const express = require("express");
const router = express.Router();

const {
  searchSpotify,
  getTrack,
  getTracks,
  getAlbum,
  getAlbums,
  getArtist,
  getArtists,
  getPlaylist,
  searchTracks,
  searchAlbums,
  searchArtists,
  searchPlaylists,
} = require("../controller/cSpotify");

const { auth } = require("../Middleware/auth");
const { searchLimiter } = require("../Middleware/rateLimiter");
const { validateQuery } = require("../Middleware/validation");
const { searchSchema } = require("../validation/schemas");

// Public Spotify endpoints (no authentication required for basic searches)
router.get(
  "/search",
  searchLimiter,
  validateQuery(searchSchema),
  searchSpotify
);
router.get(
  "/search/tracks",
  searchLimiter,
  validateQuery(searchSchema),
  searchTracks
);
router.get(
  "/search/albums",
  searchLimiter,
  validateQuery(searchSchema),
  searchAlbums
);
router.get(
  "/search/artists",
  searchLimiter,
  validateQuery(searchSchema),
  searchArtists
);
router.get(
  "/search/playlists",
  searchLimiter,
  validateQuery(searchSchema),
  searchPlaylists
);

// Get specific items by ID
router.get("/tracks/:trackId", getTrack);
router.get("/tracks", getTracks);
router.get("/albums/:albumId", getAlbum);
router.get("/albums", getAlbums);
router.get("/artists/:artistId", getArtist);
router.get("/artists", getArtists);
router.get("/playlists/:playlistId", getPlaylist);

module.exports = router;
