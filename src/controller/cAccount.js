const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const accountSchema = require("../utils/accountSchema");
const User = require("../Model/mAccount");

// Multer storage config for profile picture
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `storage/${req.body.username}`;
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;
    if (allowed.test(ext) && allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpeg, jpg, png allowed"));
    }
  },
});

// Register controller
const register = async (req, res) => {
  // Use upload.single middleware for 'profile_picture'
  upload.single("profile_picture")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Validate input
    const { error, value } = accountSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map(e => e.message) });
    }

    try {
      // Check if username or email already exists
      const exists = await User.findOne({
        where: {
          [User.sequelize.Op.or]: [
            { username: value.username },
            { email: value.email }
          ]
        }
      });
      if (exists) {
        return res.status(409).json({ error: "Username or email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(value.password, 10);

      // Prepare profile picture path
      let profilePicPath = null;
      if (req.file) {
        profilePicPath = req.file.path.replace(/\\/g, "/"); // For Windows path
      }

      // Generate API key
      const apiKey = crypto.randomUUID();

      // Insert user
      const user = await User.create({
        username: value.username,
        email: value.email,
        password_hash: hashedPassword,
        full_name: value.full_name,
        profile_picture: profilePicPath,
        date_of_birth: value.date_of_birth,
        country: value.country,
        ROLE: "user",
        streaming_quota: 0,
        download_quota: 0,
        is_active: true,
        api_key: apiKey,
        api_level: "free",
        api_quota: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return res.status(201).json({ message: "Registration successful", user });
    } catch (e) {
      console.error("Register error:", e);
      return res.status(500).json({ error: "Registration failed" });
    }
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Please provide email and password",
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Remove sensitive info
    const userData = { ...user.toJSON() };
    delete userData.password_hash;
    delete userData.refresh_token;

    // Generate JWT token (never expires)
    const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (e) {
    console.error("Login error:", e);
    return res.status(500).json({ error: "Login failed" });
  }
};

const logout = async (req, res) => {
  if (!req.cookies?.jwt) {
    return res.sendStatus(204);
  }

  res.clearCookie("jwt", { httpOnly: true });
  return res.sendStatus(204);
};

module.exports = { register, upload, login, logout };
