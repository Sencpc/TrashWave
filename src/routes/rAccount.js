const express = require("express");
const router = express.Router();

const { register, upload, login, logout } = require("../controller/cAccount");

router.post("/register", upload.single("profile_picture"), register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
