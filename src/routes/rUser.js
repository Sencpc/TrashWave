const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  deleteUser,
  getUserPlaylists,
  getUserFollowing,
  getUserLikedSongs,
  getUserLikedAlbums,
  getUserDownloads,
  subscribeUser,
  getUserSubscription,
} = require("../controller/cUser");

const { auth, admin } = require("../Middleware/auth");
const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../Middleware/validation");
const {
  updateProfileSchema,
  subscribeSchema,
  paginationSchema,
} = require("../validation/schemas");

// Admin only routes
router.get("/", auth, admin, validateQuery(paginationSchema), getAllUsers);
router.put("/:id", auth, admin, validateBody(updateProfileSchema), updateUser);
router.delete("/:id", auth, admin, deleteUser);

// Authenticated routes
router.get("/me", auth, getCurrentUser);
router.get("/:id", auth, getUserById);
router.get(
  "/:id/playlists",
  auth,
  validateQuery(paginationSchema),
  getUserPlaylists
);
router.get(
  "/:id/following",
  auth,
  validateQuery(paginationSchema),
  getUserFollowing
);
router.get(
  "/:id/liked-songs",
  auth,
  validateQuery(paginationSchema),
  getUserLikedSongs
);
router.get(
  "/:id/liked-albums",
  auth,
  validateQuery(paginationSchema),
  getUserLikedAlbums
);
router.get(
  "/:id/downloads",
  auth,
  validateQuery(paginationSchema),
  getUserDownloads
);
router.post(
  "/:id/subscribe",
  auth,
  validateBody(subscribeSchema),
  subscribeUser
);
router.get("/:id/subscription", auth, getUserSubscription);

module.exports = router;
