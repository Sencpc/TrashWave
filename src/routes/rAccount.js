const express = require("express");
const router = express.Router();

const { register, upload, login, logout } = require("../controller/cAccount");

router.post("/register", upload.single("profile_picture"), register);
router.post("/login", login);
router.get("/logout", logout);
router.put("/profile", upload.single("profile_picture"), updateProfile);

module.exports = router;
