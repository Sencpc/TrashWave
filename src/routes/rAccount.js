const express = require("express");
const router = express.Router();

<<<<<<< HEAD
const { register, upload, login, logout, updateProfile } = require("../controller/cAccount");
=======
const {
  register,
  login,
  logout,
  updateProfile,
  getUser,
  getUserByUsername,
} = require("../controller/cAccount");
const { auth } = require("../Middleware/auth");
>>>>>>> 7abce13f19f62a628bb46071527c06260c252e56

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.put("/profile", auth, updateProfile);

// Tambahan endpoint:
router.get("/user", getUser); // GET user by API key (header: x-api-key)
router.get("/user/:username", getUserByUsername); // GET user by username (public)

module.exports = router;
