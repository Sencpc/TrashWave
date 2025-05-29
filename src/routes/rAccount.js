const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  updateProfile,
} = require("../controller/cAccount");
const { auth } = require("../Middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.put("/profile", auth, updateProfile);

module.exports = router;
