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
} = require("../controller/cAccount");
const { auth } = require("../Middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.put("/profile", auth, updateProfile);
router.post("/subscribe", subscribeUser);

// Tambahan endpoint:
router.get("/user", getUser); // GET user by API key (header: x-api-key)
router.get("/user/:username", getUserByUsername); // GET user by username (public)

module.exports = router;
