const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  updateProfile,
  getUser,
  getUserByUsername,
  subscribeUser,
  getUserQuota,
  createAdmin,
} = require("../controller/cAccount");
const { auth } = require("../Middleware/auth");
const { authLimiter, uploadLimiter } = require("../Middleware/rateLimiter");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.get("/logout", logout);
router.put("/profile", auth, uploadLimiter, updateProfile);
router.post("/subscribe", subscribeUser);
router.post("/admin", authLimiter, createAdmin);

// Tambahan endpoint:
router.get("/user", getUser); // GET user by API key (header: x-api-key)
router.get("/user/:username", getUserByUsername); // GET user by username (public)
router.get("/quota", getUserQuota); // GET /api/v1/account/quota (header: x-api-key)

module.exports = router;
