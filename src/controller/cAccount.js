const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { Op } = require("sequelize");
const { accountSchema, subscribeSchema } = require("../validation/schemas");
const {
  User,
  PaymentTransaction,
  SubscriptionPlan,
  UserLikeSong,
  UserLikeAlbum,
  UserLikePlaylist,
  UserFollowArtist,
  Song,
  Album,
  Playlist,
  Artist,
  UserDownload,
} = require("../Model/mIndex");

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
    if (!req.user) {
      return res.status(401).json({ error: "API key required" });
    }

    // Find user by API key
    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Get validated data from middleware
    const {
      full_name,
      date_of_birth,
      country,
      gender,
      username,
      email,
      password,
      phone,
      bio,
    } = req.body;

    // Prepare update data
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (date_of_birth) updateData.date_of_birth = date_of_birth;
    if (country) updateData.country = country;
    if (gender) updateData.gender = gender;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (bio) updateData.bio = bio;

    // Handle password update
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 10);
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
    if (!req.user) {
      return res.status(401).json({ error: "API key required" });
    }
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: [
        "id",
        "username",
        "full_name",
        "date_of_birth",
        "country",
        "gender",
        "profile_picture",
        "api_level",
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Liked Songs (beserta artist name)
    const likedSongs = await UserLikeSong.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Song,
          as: "Song",
          attributes: ["id", "title", "artist_id"],
          include: [
            {
              model: Artist,
              as: "artist",
              attributes: ["id", "stage_name"],
            },
          ],
        },
      ],
    });

    // Liked Albums (beserta artist name)
    const likedAlbums = await UserLikeAlbum.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Album,
          as: "Album",
          attributes: ["id", "title", "artist_id"],
          include: [
            {
              model: Artist,
              as: "artist",
              attributes: ["id", "stage_name"],
            },
          ],
        },
      ],
    });

    // Liked Playlists (beserta username pembuat playlist)
    const likedPlaylists = await UserLikePlaylist.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Playlist,
          as: "Playlist",
          attributes: ["id", "name", "user_id"],
          include: [
            {
              model: User,
              attributes: ["username"],
            },
          ],
        },
      ],
    });

    // Followed Artists
    const followedArtists = await UserFollowArtist.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Artist,
          as: "Artist",
          attributes: ["id", "stage_name"],
        },
      ],
    });

    // Downloaded Songs (beserta artist name)
    const downloadedSongs = await UserDownload.findAll({
      where: { user_id: user.id },
      include: [
        {
          model: Song,
          attributes: ["id", "title", "artist_id"],
          include: [
            {
              model: Artist,
              as: "artist",
              attributes: ["id", "stage_name"],
            },
          ],
        },
      ],
    });

    return res.json({
      ...user.toJSON(),
      subscription_plan: user.api_level,
      liked_songs: likedSongs.map((l) => ({
        id: l.Song.id,
        title: l.Song.title,
        artist: l.Song.artist
          ? { id: l.Song.artist.id, name: l.Song.artist.stage_name }
          : null,
      })),
      liked_albums: likedAlbums.map((l) => ({
        id: l.Album.id,
        title: l.Album.title,
        artist: l.Album.artist
          ? { id: l.Album.artist.id, name: l.Album.artist.stage_name }
          : null,
      })),
      liked_playlists: likedPlaylists.map((l) => ({
        id: l.Playlist.id,
        name: l.Playlist.name,
        created_by: l.Playlist.User ? l.Playlist.User.username : null,
      })),
      followed_artists: followedArtists.map((f) => ({
        id: f.Artist.id,
        name: f.Artist.stage_name,
      })),
      downloaded_songs: downloadedSongs.map((d) => ({
        id: d.Song.id,
        title: d.Song.title,
        artist: d.Song.artist
          ? { id: d.Song.artist.id, name: d.Song.artist.stage_name }
          : null,
      })),
    });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Failed to get user", details: e.message });
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
  try {
    const { api_level } = req.body;
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
    let planName = api_level;
    if (api_level === "premium") amount = 50000;
    else if (api_level === "premium_lite") amount = 25000;

    // Update api_level dan kuota user
    const quota = getQuotaByApiLevel(api_level);
    user.api_level = api_level;
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
        api_level: api_level,
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
    return res
      .status(500)
      .json({ error: "Subscription failed", details: e.message });
  }
};

// GET /account/subscription/plans - Get all subscription plans
const getSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      where: { is_active: true },
      order: [["price", "ASC"]],
    });

    return res.status(200).json({ plans });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch subscription plans" });
  }
};

// POST /account/subscription/subscribe - Subscribe to a plan
const subscribeToPlан = async (req, res) => {
  try {
    const { plan_id, payment_method } = req.body;
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    const user = await User.findOne({ where: { api_key: apiKey } });
    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    if (!plan_id || !payment_method) {
      return res
        .status(400)
        .json({ error: "Plan ID and payment method are required" });
    }

    const plan = await SubscriptionPlan.findByPk(plan_id);
    if (!plan || !plan.is_active) {
      return res
        .status(404)
        .json({ error: "Subscription plan not found or inactive" });
    }

    // Create payment transaction
    const transaction = await PaymentTransaction.create({
      user_id: user.id,
      subscription_plan_id: plan_id,
      amount: plan.price,
      currency: "IDR",
      payment_method,
      payment_provider: "internal",
      transaction_id: crypto.randomUUID(),
      status: "pending",
      payment_date: new Date(),
    });

    // In a real application, you would integrate with a payment processor here
    // For now, we'll simulate successful payment

    // Update user subscription
    await user.update({
      subscription_plan_id: plan_id,
      api_level: plan.name.toLowerCase().replace(" ", "_"),
      streaming_quota: plan.streaming_limit || -1,
      download_quota: plan.download_limit || -1,
      subscription_expires_at: new Date(
        Date.now() + (plan.duration_days || 30) * 24 * 60 * 60 * 1000
      ),
      updated_at: new Date(),
    });

    // Update transaction status
    await transaction.update({
      status: "completed",
      processed_at: new Date(),
    });

    return res.status(200).json({
      message: "Subscription successful",
      subscription: {
        plan: plan.name,
        streaming_quota: plan.streaming_limit || -1,
        download_quota: plan.download_limit || -1,
        expires_at: new Date(
          Date.now() + (plan.duration_days || 30) * 24 * 60 * 60 * 1000
        ),
      },
      transaction_id: transaction.id,
    });
  } catch (error) {
    console.error("Subscribe error:", error);
    return res.status(500).json({ error: "Failed to process subscription" });
  }
};

// GET /account/subscription/current - Get current user subscription
const getCurrentSubscription = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    const user = await User.findOne({
      where: { api_key: apiKey },
      attributes: [
        "api_level",
        "streaming_quota",
        "download_quota",
        "subscription_expires_at",
      ],
      include: [
        {
          model: SubscriptionPlan,
          as: "subscriptionPlan",
          attributes: ["name", "description", "price"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      subscription: {
        plan: user.api_level,
        streaming_quota: user.streaming_quota,
        download_quota: user.download_quota,
        expires_at: user.subscription_expires_at,
        plan_details: user.subscriptionPlan,
      },
    });
  } catch (error) {
    console.error("Get current subscription error:", error);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

// GET /account/subscription/transactions - Get user's transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    const user = await User.findOne({ where: { api_key: apiKey } });
    if (!user) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    const transactions = await PaymentTransaction.findAndCountAll({
      where: { user_id: user.id },
      include: [
        {
          model: SubscriptionPlan,
          as: "subscriptionPlan",
          attributes: ["name", "duration_days"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      transactions: transactions.rows,
      pagination: {
        total: transactions.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(transactions.count / limit),
      },
    });
  } catch (error) {
    console.error("Get transaction history error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch transaction history" });
  }
};

const deleteAccount = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "API key required" });
    }

    const user = await User.findOne({ where: { id: req.user.id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Optional: Require password confirmation for security
    const { password } = req.body;
    if (password) {
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }
    }

    // Soft delete approach - deactivate account instead of hard delete
    await user.update({
      is_active: false,
      deleted_at: new Date(),
      email: `deleted_${user.id}_${user.email}`, // Prevent email conflicts
      username: `deleted_${user.id}_${user.username}`, // Prevent username conflicts
      api_key: null, // Invalidate API key
    });

    return res.status(200).json({
      message: "Account deleted successfully",
      note: "Your account has been deactivated. Contact support if you wish to reactivate it.",
    });
  } catch (e) {
    console.error("Delete account error:", e);
    return res.status(500).json({ error: "Account deletion failed" });
  }
};

// GET user quota information
const getUserQuota = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "API key required" });
    }

    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: [
        "id",
        "username",
        "api_level",
        "streaming_quota",
        "download_quota",
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      quota: {
        api_level: user.api_level,
        streaming_quota: user.streaming_quota,
        download_quota: user.download_quota,
      },
    });
  } catch (error) {
    console.error("Get user quota error:", error);
    return res.status(500).json({ error: "Failed to fetch user quota" });
  }
};

// Create admin account (Admin only)
const createAdmin = async (req, res) => {
  try {
    const { username, email, password, full_name } = req.body;

    // Check if username or email already exists
    const exists = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });
    if (exists) {
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate API key
    const apiKey = crypto.randomUUID();

    // Set quota for admin (premium level)
    const quota = getQuotaByApiLevel("premium");

    // Create admin user
    const admin = await User.create({
      username,
      email,
      password_hash: hashedPassword,
      full_name,
      ROLE: "admin",
      streaming_quota: quota.streaming_quota,
      download_quota: quota.download_quota,
      is_active: true,
      api_key: apiKey,
      api_level: "premium",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Remove sensitive info from response
    const adminData = { ...admin.toJSON() };
    delete adminData.password_hash;
    delete adminData.api_key;

    return res.status(201).json({
      message: "Admin account created successfully",
      admin: adminData,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return res.status(500).json({ error: "Failed to create admin account" });
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
  deleteAccount,
  getSubscriptionPlans,
  subscribeToPlан,
  getCurrentSubscription,
  getTransactionHistory,
};
