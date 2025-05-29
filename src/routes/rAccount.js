const express = require("express");
const router = express.Router();

const { register, login, refreshToken, logout } = require("../controller/cAccount");

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;
