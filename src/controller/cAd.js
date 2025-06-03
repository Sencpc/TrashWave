const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Ad = require("../Model/mAd");
const AdView = require("../Model/mAdView");
const User = require("../Model/mAccount");
const { Op } = require("sequelize");

// Multer storage config for ad media files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `storage/ads/${file.fieldname}`;
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const name = `${file.fieldname}_${timestamp}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = {
      image: /jpeg|jpg|png|gif/,
      video: /mp4|avi|mov|wmv/,
      audio: /mp3|wav|flac|m4a/,
    };

    const fieldType =
      file.fieldname === "image"
        ? "image"
        : file.fieldname === "video"
        ? "video"
        : "audio";

    const allowed = allowedTypes[fieldType];
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (allowed.test(ext) && allowed.test(mime)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type for ${fieldType}`));
    }
  },
});

const uploadMiddleware = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "video", maxCount: 1 },
  { name: "audio", maxCount: 1 },
]);

// Get all ads (for users)
const getAllAds = async (req, res) => {
  try {
    const { type, active_only = true } = req.query;

    const whereClause = {};

    if (active_only === "true") {
      whereClause.is_active = true;
      whereClause.start_date = { [Op.lte]: new Date() };
      whereClause[Op.or] = [
        { end_date: null },
        { end_date: { [Op.gte]: new Date() } },
      ];
    }

    if (type) {
      whereClause.ad_type = type;
    }

    const ads = await Ad.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "advertiser",
          attributes: ["id", "username", "email"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.json({
      success: true,
      data: ads,
    });
  } catch (error) {
    console.error("Error fetching ads:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ads",
    });
  }
};

// Get ad by ID
const getAdById = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByPk(id, {
      include: [
        {
          model: User,
          as: "advertiser",
          attributes: ["id", "username", "email"],
        },
        {
          model: AdView,
          as: "views",
          attributes: ["view_type", "created_at"],
        },
      ],
    });

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    res.json({
      success: true,
      data: ad,
    });
  } catch (error) {
    console.error("Error fetching ad:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch ad",
    });
  }
};

// Create new ad (admin/advertiser only)
const createAd = async (req, res) => {
  try {
    const {
      title,
      description,
      target_url,
      ad_type,
      duration,
      target_audience,
      budget,
      cost_per_view,
      start_date,
      end_date,
    } = req.body;

    const adData = {
      advertiser_id: req.user.id,
      title,
      description,
      target_url,
      ad_type,
      duration,
      target_audience: target_audience ? JSON.parse(target_audience) : null,
      budget: parseFloat(budget),
      cost_per_view: parseFloat(cost_per_view),
      start_date,
      end_date,
    };

    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        adData.image_url = `/storage/ads/image/${req.files.image[0].filename}`;
      }
      if (req.files.video) {
        adData.video_url = `/storage/ads/video/${req.files.video[0].filename}`;
      }
      if (req.files.audio) {
        adData.audio_url = `/storage/ads/audio/${req.files.audio[0].filename}`;
      }
    }

    const ad = await Ad.create(adData);

    res.status(201).json({
      success: true,
      message: "Ad created successfully",
      data: ad,
    });
  } catch (error) {
    console.error("Error creating ad:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create ad",
    });
  }
};

// Update ad
const updateAd = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Check ownership (advertiser can only edit their own ads, admin can edit all)
    if (req.user.role !== "admin" && ad.advertiser_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to edit this ad",
      });
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        updateData.image_url = `/storage/ads/image/${req.files.image[0].filename}`;
      }
      if (req.files.video) {
        updateData.video_url = `/storage/ads/video/${req.files.video[0].filename}`;
      }
      if (req.files.audio) {
        updateData.audio_url = `/storage/ads/audio/${req.files.audio[0].filename}`;
      }
    }

    if (
      updateData.target_audience &&
      typeof updateData.target_audience === "string"
    ) {
      updateData.target_audience = JSON.parse(updateData.target_audience);
    }

    await ad.update(updateData);

    res.json({
      success: true,
      message: "Ad updated successfully",
      data: ad,
    });
  } catch (error) {
    console.error("Error updating ad:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update ad",
    });
  }
};

// Delete ad
const deleteAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Check ownership (advertiser can only delete their own ads, admin can delete all)
    if (req.user.role !== "admin" && ad.advertiser_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this ad",
      });
    }

    await ad.destroy();

    res.json({
      success: true,
      message: "Ad deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ad:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete ad",
    });
  }
};

// Watch ad (track impression)
const watchAd = async (req, res) => {
  try {
    const { id } = req.params;
    const { view_duration, complete_view = false } = req.body;

    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    if (!ad.is_active) {
      return res.status(400).json({
        success: false,
        message: "Ad is not active",
      });
    }

    // Get user IP and user agent
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get("User-Agent");
    const referrer = req.get("Referrer");

    // Create ad view record
    const viewData = {
      ad_id: id,
      user_id: req.user ? req.user.id : null,
      view_type: complete_view ? "complete_view" : "impression",
      view_duration: view_duration || null,
      ip_address,
      user_agent,
      referrer,
    };

    await AdView.create(viewData);

    // Update ad statistics
    await ad.increment("total_views");

    // Calculate reward for user (if authenticated and free tier)
    let reward = null;
    if (req.user && req.user.subscription_plan === "Free" && complete_view) {
      // Award some benefit for watching complete ad
      reward = {
        message: "Thanks for watching! You've earned bonus plays.",
        bonus_plays: 5,
      };
    }

    res.json({
      success: true,
      message: "Ad view recorded",
      reward,
    });
  } catch (error) {
    console.error("Error recording ad view:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record ad view",
    });
  }
};

// Click ad (track click)
const clickAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Get user IP and user agent
    const ip_address = req.ip || req.connection.remoteAddress;
    const user_agent = req.get("User-Agent");
    const referrer = req.get("Referrer");

    // Create ad click record
    await AdView.create({
      ad_id: id,
      user_id: req.user ? req.user.id : null,
      view_type: "click",
      ip_address,
      user_agent,
      referrer,
    });

    // Update ad statistics
    await ad.increment("total_clicks");

    res.json({
      success: true,
      message: "Ad click recorded",
      target_url: ad.target_url,
    });
  } catch (error) {
    console.error("Error recording ad click:", error);
    res.status(500).json({
      success: false,
      message: "Failed to record ad click",
    });
  }
};

// Get ad analytics (advertiser/admin only)
const getAdAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await Ad.findByPk(id);
    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "Ad not found",
      });
    }

    // Check ownership
    if (req.user.role !== "admin" && ad.advertiser_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view analytics",
      });
    }

    // Get detailed analytics
    const views = await AdView.findAll({
      where: { ad_id: id },
      attributes: ["view_type", "created_at", "view_duration"],
      order: [["created_at", "DESC"]],
    });

    const analytics = {
      total_impressions: views.filter((v) => v.view_type === "impression")
        .length,
      total_clicks: views.filter((v) => v.view_type === "click").length,
      total_complete_views: views.filter((v) => v.view_type === "complete_view")
        .length,
      click_through_rate: 0,
      completion_rate: 0,
      total_spent: 0,
      views_over_time: {},
    };

    if (analytics.total_impressions > 0) {
      analytics.click_through_rate = (
        (analytics.total_clicks / analytics.total_impressions) *
        100
      ).toFixed(2);
      analytics.completion_rate = (
        (analytics.total_complete_views / analytics.total_impressions) *
        100
      ).toFixed(2);
    }

    analytics.total_spent = (
      ad.total_views * parseFloat(ad.cost_per_view)
    ).toFixed(2);

    res.json({
      success: true,
      data: {
        ad: {
          id: ad.id,
          title: ad.title,
          ad_type: ad.ad_type,
          total_views: ad.total_views,
          total_clicks: ad.total_clicks,
          budget: ad.budget,
          cost_per_view: ad.cost_per_view,
        },
        analytics,
      },
    });
  } catch (error) {
    console.error("Error fetching ad analytics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
};

module.exports = {
  uploadMiddleware,
  getAllAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  watchAd,
  clickAd,
  getAdAnalytics,
};
