const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Ad, AdView, User } = require("../Model/mIndex");
const { Op, Sequelize } = require("sequelize");
const { sequelize } = require("../config/db");

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
  fileFilter: (req, file, cb) => {    const allowedTypes = {
      image: {
        extensions: /\.(jpeg|jpg|png|gif)$/i,
        mimeTypes: /^image\/(jpeg|png|gif)$/
      },
      video: {
        extensions: /\.(mp4|avi|mov|wmv)$/i,
        mimeTypes: /^video\/(mp4|x-msvideo|quicktime|x-ms-wmv)$/
      },
      audio: {
        extensions: /\.(mp3|wav|flac|m4a)$/i,
        mimeTypes: /^audio\/(mpeg|mp3|wav|flac|x-m4a)$/
      }
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

    console.log('File upload attempt:', {
      fieldType,
      filename: file.originalname,
      extension: ext,
      mimeType: mime
    });

    if (allowed.extensions.test(ext) && allowed.mimeTypes.test(mime)) {
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

// Create new ad (admin/advertiser only)
const createAd = async (req, res) => {
  try {    const {
      title,
      description,
      target_url,
      budget,
      start_date,
      end_date,
      streaming_quota,
    } = req.body;

    const adData = {
      advertiser_id: req.user.id,
      title,
      description,
      target_url,
      budget: parseFloat(budget),
      start_date,
      end_date,
      total_getSQ: streaming_quota ? parseInt(streaming_quota) : 1,
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

// Watch ad - Get random active ad (for free tier users with 0 streaming quota)
const watchAd = async (req, res) => {
  try {
    // Check if user is free tier and has 0 streaming quota
    const user = await User.findByPk(req.user.id);
    
    if (user.api_level !== 'free') {
      return res.status(403).json({
        success: false,
        message: "Only free tier users can watch ads",
      });
    }

    if (user.streaming_quota > 0) {
      return res.status(400).json({
        success: false,
        message: "You still have streaming quota available. No need to watch ads.",
        streaming_quota: user.streaming_quota
      });
    }    // Get a random active ad
    const ad = await Ad.findOne({
      where: {
        is_active: true,
        end_date: {
          [Op.gt]: new Date() // Only get ads that haven't expired
        }
      },
      order: Sequelize.literal('RAND()') // Get random ad using MySQL RAND() function
    });

    if (!ad) {
      return res.status(404).json({
        success: false,
        message: "No active ads available",
      });
    }

    // Record basic view
    await AdView.create({
      ad_id: ad.id,
      user_id: req.user ? req.user.id : null,
      view_type: 'impression',
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get("User-Agent"),
    });    // Update view count
    await ad.increment("total_views");

    // Add streaming quota to user
    const quotaToAward = ad.total_getSQ || 1;
    await user.increment('streaming_quota', { by: quotaToAward });
    
    // Get updated user data
    const updatedUser = await User.findByPk(req.user.id);

    res.json({
      target_url: ad.target_url,
      streaming_quota_awarded: quotaToAward,
      current_streaming_quota: updatedUser.streaming_quota
    });
  } catch (error) {
    console.error("Error getting ad:", error);
    res.status(500).json({
      message: "Failed to get ad",
    });
  }
};


module.exports = {
  uploadMiddleware,
  createAd,
  watchAd,
};
