const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const accountSchema = require("../utils/accountSchema");
const { User } = require("../Model/mIndex");
const { Op } = require("sequelize");

// Multer storage config for profile picture
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `storage/${req.body.username || 'temp'}`;
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
  // Tidak perlu upload.single di sini, sudah di route!
  try {
    console.log("req.body:", req.body);
    console.log("req.file:", req.file);

    const { error, value } = accountSchema.validate(req.body, { abortEarly: false, allowUnknown: true });
    if (error) {
      return res.status(400).json({ errors: error.details.map(e => e.message) });
    }

    const exists = await User.findOne({
      where: {
        [Op.or]: [
          { username: value.username },
          { email: value.email }
        ]
      }
    });

    if (exists) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    // Profile picture is optional
    let profilePicPath = null;
    if (req.file) {
      profilePicPath = req.file.path.replace(/\\/g, "/");
    }

    const apiKey = crypto.randomUUID();

    const userData = {
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
    };

    const user = await User.create(userData);

    return res.status(201).json({ message: "Registration successful", user });
  } catch (e) {
    return res.status(500).json({ error: "Registration failed", details: e.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Please provide email and password",
    });
  }

  try {
    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const userData = { ...user.toJSON() };
    delete userData.password_hash;
    delete userData.refresh_token;

    const token = jwt.sign(userData, process.env.ACCESS_TOKEN_SECRET);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (e) {
    return res.status(500).json({ error: "Login failed", details: e.message });
  }
};

const logout = async (req, res) => {
  if (!req.cookies?.jwt) {
    return res.sendStatus(204);
  }
  res.clearCookie("jwt", { httpOnly: true });
  return res.sendStatus(204);
};

const updateProfile = async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    const user = await User.findOne({ where: { api_key: apiKey } });
    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Validate input (reuse accountSchema but make all fields optional)
    const updateSchema = accountSchema.fork(
      ['username', 'email', 'confirm_password', 'password'],
      (schema) => schema.optional()
    );
    const { error, value } = updateSchema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({ errors: error.details.map(e => e.message) });
    }

    const updateData = {};
    if (value.full_name) updateData.full_name = value.full_name;
    if (value.date_of_birth) updateData.date_of_birth = value.date_of_birth;
    if (value.country) updateData.country = value.country;

    if (value.password) {
      updateData.password_hash = await bcrypt.hash(value.password, 10);
    }

    // Profile picture is optional
    if (req.file) {
      updateData.profile_picture = req.file.path.replace(/\\/g, "/");
    }

    await user.update(updateData);

    const userData = { ...user.toJSON() };
    delete userData.password_hash;
    delete userData.refresh_token;

    return res.status(200).json({ message: "Profile updated", user: userData });
  } catch (e) {
    return res.status(500).json({ error: "Profile update failed", details: e.message });
  }
};

module.exports = { register, upload, login, logout, updateProfile };