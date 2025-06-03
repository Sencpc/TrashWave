const {
  User,
  Artist,
  Song,
  Album,
  Playlist,
  SubscriptionPlan,
  PaymentTransaction,
  ApiLog,
} = require("../Model/mIndex");
const { Op } = require("sequelize");
const SpotifyAPI = require("../utils/SpotifyAPI");

// GET /admin/dashboard - Get admin dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalArtists,
      totalSongs,
      totalAlbums,
      totalPlaylists,
      totalRevenue,
    ] = await Promise.all([
      User.count({ where: { role: "user" } }),
      Artist.count({ where: { deleted_at: null } }),
      Song.count({ where: { deleted_at: null } }),
      Album.count({ where: { deleted_at: null } }),
      Playlist.count({ where: { deleted_at: null } }),
      PaymentTransaction.sum("amount", {
        where: { transaction_status: "completed" },
      }) || 0,
    ]);

    // Get recent registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRegistrations = await User.count({
      where: {
        created_at: { [Op.gte]: thirtyDaysAgo },
        role: "user",
      },
    });

    // Get subscription distribution
    const subscriptionStats = await User.findAll({
      attributes: [
        "subscription_plan",
        [User.sequelize.fn("COUNT", User.sequelize.col("id")), "count"],
      ],
      where: { role: "user" },
      group: ["subscription_plan"],
    });

    // Get top genres
    const topGenres = await Song.findAll({
      attributes: [
        "genre",
        [Song.sequelize.fn("COUNT", Song.sequelize.col("id")), "count"],
      ],
      where: { deleted_at: null },
      group: ["genre"],
      order: [[Song.sequelize.fn("COUNT", Song.sequelize.col("id")), "DESC"]],
      limit: 10,
    });

    return res.status(200).json({
      stats: {
        total_users: totalUsers,
        total_artists: totalArtists,
        total_songs: totalSongs,
        total_albums: totalAlbums,
        total_playlists: totalPlaylists,
        total_revenue: totalRevenue,
        recent_registrations: recentRegistrations,
      },
      subscription_distribution: subscriptionStats,
      top_genres: topGenres,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch dashboard statistics" });
  }
};

// GET /admin/users - Get all users with advanced filters
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      role,
      subscription_plan,
      is_active,
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;
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
    if (is_active !== undefined) where.is_active = is_active === "true";

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ["password_hash", "refresh_token"] },
      order: [[sort_by, sort_order.toUpperCase()]],
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
    console.error("Get users error:", error);
    return res.status(500).json({ error: "Failed to fetch users" });
  }
};

// GET /admin/artists - Get all artists with verification status
const getArtists = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      verification_status,
      sort_by = "created_at",
      sort_order = "DESC",
    } = req.query;
    const offset = (page - 1) * limit;

    const where = { deleted_at: null };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (verification_status) where.verification_status = verification_status;

    const artists = await Artist.findAndCountAll({
      where,
      attributes: { exclude: ["password_hash"] },
      order: [[sort_by, sort_order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      artists: artists.rows,
      pagination: {
        total: artists.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(artists.count / limit),
      },
    });
  } catch (error) {
    console.error("Get artists error:", error);
    return res.status(500).json({ error: "Failed to fetch artists" });
  }
};

// GET /admin/content - Get content overview
const getContentOverview = async (req, res) => {
  try {
    const { page = 1, limit = 20, type = "songs", search } = req.query;
    const offset = (page - 1) * limit;

    let result;
    const where = { deleted_at: null };

    if (search) {
      where[Op.or] = [{ title: { [Op.iLike]: `%${search}%` } }];
    }

    switch (type) {
      case "songs":
        if (search) {
          where[Op.or] = [
            { title: { [Op.iLike]: `%${search}%` } },
            { genre: { [Op.iLike]: `%${search}%` } },
          ];
        }
        result = await Song.findAndCountAll({
          where,
          include: [
            { model: Artist, as: "artist", attributes: ["id", "name"] },
            {
              model: Album,
              as: "album",
              attributes: ["id", "title"],
              required: false,
            },
          ],
          order: [["created_at", "DESC"]],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        break;

      case "albums":
        result = await Album.findAndCountAll({
          where,
          include: [
            { model: Artist, as: "artist", attributes: ["id", "name"] },
          ],
          order: [["created_at", "DESC"]],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        break;

      case "playlists":
        if (search) {
          where[Op.or] = [
            { name: { [Op.iLike]: `%${search}%` } },
            { description: { [Op.iLike]: `%${search}%` } },
          ];
        }
        result = await Playlist.findAndCountAll({
          where,
          include: [
            { model: User, as: "user", attributes: ["id", "username"] },
          ],
          order: [["created_at", "DESC"]],
          limit: parseInt(limit),
          offset: parseInt(offset),
        });
        break;

      default:
        return res.status(400).json({ error: "Invalid content type" });
    }

    return res.status(200).json({
      content: result.rows,
      type,
      pagination: {
        total: result.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(result.count / limit),
      },
    });
  } catch (error) {
    console.error("Get content overview error:", error);
    return res.status(500).json({ error: "Failed to fetch content overview" });
  }
};

// GET /admin/transactions - Get payment transactions
const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      payment_method,
      start_date,
      end_date,
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (status) where.transaction_status = status;
    if (payment_method) where.payment_method = payment_method;
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    }

    const transactions = await PaymentTransaction.findAndCountAll({
      where,
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
        {
          model: SubscriptionPlan,
          as: "subscription_plan",
          attributes: ["id", "name", "price"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Calculate total revenue for filtered results
    const totalRevenue =
      (await PaymentTransaction.sum("amount", {
        where: { ...where, transaction_status: "completed" },
      })) || 0;

    return res.status(200).json({
      transactions: transactions.rows,
      total_revenue: totalRevenue,
      pagination: {
        total: transactions.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(transactions.count / limit),
      },
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
};

// GET /admin/api-logs - Get API usage logs
const getApiLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      user_id,
      endpoint,
      method,
      start_date,
      end_date,
    } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (user_id) where.user_id = user_id;
    if (endpoint) where.endpoint = { [Op.iLike]: `%${endpoint}%` };
    if (method) where.method = method;
    if (start_date && end_date) {
      where.created_at = {
        [Op.between]: [new Date(start_date), new Date(end_date)],
      };
    }

    const logs = await ApiLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      logs: logs.rows,
      pagination: {
        total: logs.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(logs.count / limit),
      },
    });
  } catch (error) {
    console.error("Get API logs error:", error);
    return res.status(500).json({ error: "Failed to fetch API logs" });
  }
};

// POST /admin/subscription-plans - Create subscription plan
const createSubscriptionPlan = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      duration_days,
      streaming_quota,
      download_quota,
      features,
    } = req.body;

    if (!name || !price || !duration_days) {
      return res.status(400).json({
        error: "Name, price, and duration are required",
      });
    }

    const plan = await SubscriptionPlan.create({
      name,
      description,
      price: parseFloat(price),
      duration_days: parseInt(duration_days),
      streaming_quota: parseInt(streaming_quota) || -1, // -1 for unlimited
      download_quota: parseInt(download_quota) || 0,
      features: features || [],
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json({
      message: "Subscription plan created successfully",
      plan,
    });
  } catch (error) {
    console.error("Create subscription plan error:", error);
    return res
      .status(500)
      .json({ error: "Failed to create subscription plan" });
  }
};

// PUT /admin/subscription-plans/:id - Update subscription plan
const updateSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      duration_days,
      streaming_quota,
      download_quota,
      features,
      is_active,
    } = req.body;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (duration_days !== undefined)
      updateData.duration_days = parseInt(duration_days);
    if (streaming_quota !== undefined)
      updateData.streaming_quota = parseInt(streaming_quota);
    if (download_quota !== undefined)
      updateData.download_quota = parseInt(download_quota);
    if (features) updateData.features = features;
    if (is_active !== undefined) updateData.is_active = is_active;
    updateData.updated_at = new Date();

    await plan.update(updateData);

    return res.status(200).json({
      message: "Subscription plan updated successfully",
      plan,
    });
  } catch (error) {
    console.error("Update subscription plan error:", error);
    return res
      .status(500)
      .json({ error: "Failed to update subscription plan" });
  }
};

// DELETE /admin/subscription-plans/:id - Delete subscription plan
const deleteSubscriptionPlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await SubscriptionPlan.findByPk(id);
    if (!plan) {
      return res.status(404).json({ error: "Subscription plan not found" });
    }

    await plan.destroy();

    return res.status(200).json({
      message: "Subscription plan deleted successfully",
    });
  } catch (error) {
    console.error("Delete subscription plan error:", error);
    return res
      .status(500)
      .json({ error: "Failed to delete subscription plan" });
  }
};

// POST /admin/users/:id/ban - Ban/unban user
const toggleUserBan = async (req, res) => {
  try {
    const { id } = req.params;
    const { ban_reason } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newStatus = !user.is_active;
    await user.update({
      is_active: newStatus,
      ban_reason: newStatus ? null : ban_reason || "No reason provided",
      updated_at: new Date(),
    });

    return res.status(200).json({
      message: `User ${newStatus ? "unbanned" : "banned"} successfully`,
      user: {
        id: user.id,
        username: user.username,
        is_active: newStatus,
      },
    });
  } catch (error) {
    console.error("Toggle user ban error:", error);
    return res.status(500).json({ error: "Failed to update user status" });
  }
};

// GET /admin/spotify/search - Admin Spotify search for content management
const adminSpotifySearch = async (req, res) => {
  try {
    const {
      query,
      types = "track,album,artist",
      limit = 50,
      market,
    } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await SpotifyAPI.searchMultiple(query, types, {
      limit: parseInt(limit),
      market,
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Admin Spotify search error:", error);
    return res.status(500).json({ error: "Failed to search Spotify" });
  }
};

// GET /admin/spotify/analytics - Get Spotify content analytics
const getSpotifyAnalytics = async (req, res) => {
  try {
    // This could be extended to provide analytics on Spotify integration usage
    const analytics = {
      spotify_searches_today: 0, // This would need to be tracked in the database
      most_searched_content: "tracks",
      integration_status: "active",
      last_api_call: new Date(),
    };

    return res.status(200).json(analytics);
  } catch (error) {
    console.error("Get Spotify analytics error:", error);
    return res.status(500).json({ error: "Failed to get Spotify analytics" });
  }
};

module.exports = {
  getDashboardStats,
  getUsers,
  getArtists,
  getContentOverview,
  getTransactions,
  getApiLogs,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  toggleUserBan,
  adminSpotifySearch,
  getSpotifyAnalytics,
};
