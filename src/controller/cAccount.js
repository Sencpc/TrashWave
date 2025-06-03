const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { accountSchema, subscribeSchema } = require("../validation/schemas");
const { User, PaymentTransaction } = require("../Model/mIndex");

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
    const { error, value } = accountSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    try {
      // Check if username or email already exists
      const exists = await User.findOne({
        where: {
          [Op.or]: [{ username: value.username }, { email: value.email }],
        },
      });
      if (exists) {
        return res
          .status(409)
          .json({ error: "Username or email already exists" });
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

      // Set quota sesuai api_level (default "free" saat register)
      const quota = getQuotaByApiLevel("free");

      // Insert user
      const user = await User.create({
        username: value.username,
        email: value.email,
        password_hash: hashedPassword,
        full_name: value.full_name,
        profile_picture: profilePicPath,
        date_of_birth: value.date_of_birth,
        country: value.country,
        gender: value.gender,
        ROLE: "user",
        streaming_quota: quota.streaming_quota,
        download_quota: quota.download_quota,
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

    // Generate JWT token
    const token = jwt.sign(userData, process.env.JWT_SECRET);

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

const updateProfile = async (req, res) => {
  try {
    // Check API key in header
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    // Find user by API key
    const user = await User.findOne({ where: { api_key: apiKey } });
    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Validate input (reuse accountSchema but make all fields optional)
    const updateSchema = accountSchema.fork(
      ["username", "email", "confirm_password", "password"],
      (schema) => schema.optional()
    );
    const { error, value } = updateSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res
        .status(400)
        .json({ errors: error.details.map((e) => e.message) });
    }

    // Prepare update data
    const updateData = {};
    if (value.full_name) updateData.full_name = value.full_name;
    if (value.date_of_birth) updateData.date_of_birth = value.date_of_birth;
    if (value.country) updateData.country = value.country;

    // Handle password update
    if (value.password) {
      updateData.password_hash = await bcrypt.hash(value.password, 10);
    }

    // Handle profile picture update
    if (req.file) {
      updateData.profile_picture = req.file.path.replace(/\\/g, "/");
    }

    // Update user
    await user.update(updateData);

    // Remove sensitive info
    const userData = { ...user.toJSON() };
    delete userData.password_hash;
    delete userData.refresh_token;

    return res.status(200).json({ message: "Profile updated", user: userData });
  } catch (e) {
    console.error("Update profile error:", e);
    return res.status(500).json({ error: "Profile update failed" });
  }
};

// GET user by API key (profil sendiri)
const getUser = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }
    const user = await User.findOne({
      where: { api_key: apiKey },
      attributes: [
        "username",
        "full_name",
        "date_of_birth",
        "country",
        "gender",
        "profile_picture",
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: "Failed to get user" });
  }
};

// GET user by username (public)
const getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({
      where: { username },
      attributes: [
        "username",
        "full_name",
        "date_of_birth",
        "country",
        "gender",
        "profile_picture",
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ error: "Failed to get user" });
  }
};

const subscribeUser = async (req, res) => {
  const { error, value } = subscribeSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map((e) => e.message) });
  }

  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    const user = await User.findOne({ where: { api_key: apiKey } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Simulasi harga dan plan (bisa diambil dari SubscriptionPlan jika ingin)
    let amount = 0;
    let planName = value.api_level;
    if (value.api_level === "premium") amount = 50000;
    else if (value.api_level === "premium_lite") amount = 25000;

    // Update api_level dan kuota user
    const quota = getQuotaByApiLevel(value.api_level);
    user.api_level = value.api_level;
    user.streaming_quota = quota.streaming_quota;
    user.download_quota = quota.download_quota;
    await user.save();

    // Buat transaksi pembayaran
    const transaction = await PaymentTransaction.create({
      user_id: user.id,
      subscription_plan_id: 1, // jika tidak pakai subscription_plan, bisa null
      amount: amount,
      currency: "IDR",
      payment_method: "manual",
      payment_provider: "internal",
      transaction_id: crypto.randomUUID(),
      status: "completed",
      payment_date: new Date(),
      processed_at: new Date(),
      expires_at: null,
      failure_reason: null,
      metadata: {
        api_level: value.api_level,
      },
    });

    return res.status(200).json({
      message: "Subscription updated",
      api_level: user.api_level,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        payment_date: transaction.payment_date,
        transaction_id: transaction.transaction_id,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: "Subscription failed", details: e.message });
  }
};

const getUserQuota = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }
    const user = await User.findOne({
      where: { api_key: apiKey },
      attributes: ["username", "streaming_quota", "download_quota"],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json({
      username: user.username,
      streaming_quota: user.streaming_quota,
      download_quota: user.download_quota,
    });
  } catch (e) {
    return res.status(500).json({ error: "Failed to get user quota" });
  }
};

const createAdmin = async (req, res) => {
  // Validasi input, gunakan accountSchema tapi ROLE di-set "admin"
  const { error, value } = accountSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({ errors: error.details.map(e => e.message) });
  }

  try {
    // Cek username/email sudah ada
    const exists = await User.findOne({
      where: {
        [Op.or]: [{ username: value.username }, { email: value.email }],
      },
    });
    if (exists) {
      return res.status(409).json({ error: "Username or email already exists" });
    }

    const hashedPassword = await bcrypt.hash(value.password, 10);

    // Generate API key
    const apiKey = crypto.randomUUID();

    // Set quota admin (bisa unlimited)
    const quota = { streaming_quota: -1, download_quota: -1 };

    const user = await User.create({
      username: value.username,
      email: value.email,
      password_hash: hashedPassword,
      full_name: value.full_name,
      profile_picture: null,
      date_of_birth: value.date_of_birth,
      country: value.country,
      gender: value.gender,
      ROLE: "admin",
      streaming_quota: quota.streaming_quota,
      download_quota: quota.download_quota,
      is_active: true,
      api_key: apiKey,
      api_level: "premium",
      api_quota: 0,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({ message: "Admin account created", user });
  } catch (e) {
    return res.status(500).json({ error: "Admin registration failed", details: e.message });
  }
};

function getQuotaByApiLevel(api_level) {
  switch (api_level) {
    case "premium":
      return { streaming_quota: -1, download_quota: -1 }; // unlimited
    case "premium_lite":
      return { streaming_quota: -1, download_quota: 10 };
    case "free":
    default:
      return { streaming_quota: 5, download_quota: 0 };
  }
}

module.exports = {
  register,
  upload,
  login,
  logout,
  updateProfile,
  getUser,
  getUserByUsername,
  subscribeUser,
  getUserQuota,
  createAdmin,
};
