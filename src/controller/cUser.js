const { Op } = require("sequelize");
const User = require("../Model/mAccount");
const UserFollowArtist = require("../Model/mUserFollowArtist");
const UserLikeSong = require("../Model/mUserLikeSong");
const UserLikePlaylist = require("../Model/mUserLikePlaylist");
const UserLikeAlbum = require("../Model/mUserLikeAlbum");
const UserDownload = require("../Model/mUserDownload");
const Playlist = require("../Model/mPlaylist");
const Artist = require("../Model/mArtist");
const Song = require("../Model/mSong");
const Album = require("../Model/mAlbum");
const SubscriptionPlan = require("../Model/mSubscriptionPlan");
const PaymentTransaction = require("../Model/mPaymentTransaction");

// GET /users - Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, subscription_plan } = req.query;
    const offset = (page - 1) * limit;
    const where = {};
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { full_name: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) where.role = role;
    if (subscription_plan) where.subscription_plan = subscription_plan;

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password_hash", "api_key", "refresh_token"] },
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      users: users.rows,
      pagination: {
        total: users.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(users.count / limit),
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

// GET /users/:id - Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: { exclude: ["password_hash", "api_key", "refresh_token"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user by ID error:", error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
};

// GET /users/me - Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password_hash", "refresh_token"] },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

// PUT /users/:id - Update user (Admin only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      role,
      subscription_plan,
      is_active,
      streaming_quota,
      download_quota,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = {};
    if (role) updateData.role = role;
    if (subscription_plan) updateData.subscription_plan = subscription_plan;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (streaming_quota !== undefined)
      updateData.streaming_quota = streaming_quota;
    if (download_quota !== undefined)
      updateData.download_quota = download_quota;
    updateData.updated_at = new Date();

    await user.update(updateData);

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password_hash", "api_key", "refresh_token"] },
    });

    return res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: "Failed to update user" });
  }
};

// DELETE /users/:id - Delete user (Admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await user.destroy();

    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Failed to delete user" });
  }
};

// GET /users/:id/playlists - Get user's playlists
const getUserPlaylists = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const where = { user_id: id, deleted_at: null };

    // If requesting other user's playlists, only show public ones
    if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
      where.is_public = true;
    }

    const playlists = await Playlist.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      playlists: playlists.rows,
      pagination: {
        total: playlists.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(playlists.count / limit),
      },
    });
  } catch (error) {
    console.error("Get user playlists error:", error);
    return res.status(500).json({ error: "Failed to fetch user playlists" });
  }
};

// GET /users/:id/following - Get artists user is following
const getUserFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const following = await UserFollowArtist.findAndCountAll({
      where: { user_id: id },
      include: [
        {
          model: Artist,
          as: "artist",
          attributes: [
            "id",
            "name",
            "profile_picture",
            "verification_status",
            "follower_count",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      following: following.rows,
      pagination: {
        total: following.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(following.count / limit),
      },
    });
  } catch (error) {
    console.error("Get user following error:", error);
    return res.status(500).json({ error: "Failed to fetch user following" });
  }
};

// GET /users/:id/liked-songs - Get user's liked songs
const getUserLikedSongs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only allow users to see their own liked songs or admin
    if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const likedSongs = await UserLikeSong.findAndCountAll({
      where: { user_id: id },
      include: [
        {
          model: Song,
          as: "song",
          where: { deleted_at: null },
          include: [
            {
              model: Artist,
              as: "artist",
              attributes: ["id", "name", "profile_picture"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      liked_songs: likedSongs.rows,
      pagination: {
        total: likedSongs.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(likedSongs.count / limit),
      },
    });
  } catch (error) {
    console.error("Get user liked songs error:", error);
    return res.status(500).json({ error: "Failed to fetch user liked songs" });
  }
};

// GET /users/:id/liked-albums - Get user's liked albums
const getUserLikedAlbums = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only allow users to see their own liked albums or admin
    if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const likedAlbums = await UserLikeAlbum.findAndCountAll({
      where: { user_id: id },
      include: [
        {
          model: Album,
          as: "album",
          where: { deleted_at: null },
          include: [
            {
              model: Artist,
              as: "artist",
              attributes: ["id", "name", "profile_picture"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      liked_albums: likedAlbums.rows,
      pagination: {
        total: likedAlbums.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(likedAlbums.count / limit),
      },
    });
  } catch (error) {
    console.error("Get user liked albums error:", error);
    return res.status(500).json({ error: "Failed to fetch user liked albums" });
  }
};

// GET /users/:id/downloads - Get user's download history
const getUserDownloads = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only allow users to see their own downloads or admin
    if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const downloads = await UserDownload.findAndCountAll({
      where: { user_id: id },
      include: [
        {
          model: Song,
          as: "song",
          where: { deleted_at: null },
          include: [
            {
              model: Artist,
              as: "artist",
              attributes: ["id", "name", "profile_picture"],
            },
          ],
        },
      ],
      order: [["download_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      downloads: downloads.rows,
      pagination: {
        total: downloads.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(downloads.count / limit),
      },
    });
  } catch (error) {
    console.error("Get user downloads error:", error);
    return res.status(500).json({ error: "Failed to fetch user downloads" });
  }
};

// POST /users/:id/subscribe - Subscribe user to plan
const subscribeUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_id, payment_method } = req.body;

    // Only allow users to subscribe themselves or admin
    if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const plan = await SubscriptionPlan.findByPk(plan_id);
    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    // Create payment transaction
    const transaction = await PaymentTransaction.create({
      user_id: id,
      subscription_plan_id: plan_id,
      amount: plan.price,
      payment_method,
      transaction_status: "pending",
      created_at: new Date(),
    });

    // Update user subscription (in real app, this would happen after payment confirmation)
    await user.update({
      subscription_plan: plan.name.toLowerCase().replace(" ", "_"),
      streaming_quota: plan.streaming_quota,
      download_quota: plan.download_quota,
      updated_at: new Date(),
    });

    // Update transaction status to completed (simulation)
    await transaction.update({
      transaction_status: "completed",
      updated_at: new Date(),
    });

    return res.status(200).json({
      message: "Subscription successful",
      subscription: {
        plan: plan.name,
        streaming_quota: plan.streaming_quota,
        download_quota: plan.download_quota,
      },
      transaction_id: transaction.id,
    });
  } catch (error) {
    console.error("Subscribe user error:", error);
    return res.status(500).json({ error: "Failed to process subscription" });
  }
};

// GET /users/:id/subscription - Get user's current subscription
const getUserSubscription = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id, {
      attributes: [
        "id",
        "username",
        "subscription_plan",
        "streaming_quota",
        "download_quota",
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Only allow users to see their own subscription or admin
    if (req.user.id !== parseInt(id) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    return res.status(200).json({
      subscription: {
        plan: user.subscription_plan,
        streaming_quota: user.streaming_quota,
        download_quota: user.download_quota,
      },
    });
  } catch (error) {
    console.error("Get user subscription error:", error);
    return res.status(500).json({ error: "Failed to fetch subscription" });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  deleteUser,
  getUserPlaylists,
  getUserFollowing,
  getUserLikedSongs,
  getUserLikedAlbums,
  getUserDownloads,
  subscribeUser,
  getUserSubscription,
};
