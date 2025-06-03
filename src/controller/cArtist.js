const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const models = require("../model/mIndex");
const { registerArtistSchema } = require("../validation/schemas");
const { Op } = require("sequelize");

// Multer storage config for artist profile picture
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `storage/artists/profiles`;
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `profile_${timestamp}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// GET /artists - Get all artists with pagination and search
const getAllArtists = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, genre } = req.query;
    const offset = (page - 1) * limit;

    const where = { deleted_at: null };
    if (search) {
      where[models.Artist.sequelize.Op.or] = [
        { name: { [models.Artist.sequelize.Op.iLike]: `%${search}%` } },
        { bio: { [models.Artist.sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (genre) {
      where.genres = { [models.Artist.sequelize.Op.contains]: [genre] };
    }

    const artists = await models.Artist.findAndCountAll({
      where,
      attributes: [
      "id",
      "stage_name", 
      "bio",
      "genre",
      "follower_count",
      "monthly_listeners",
      "verified",
      "created_at"
      ],
      order: [["follower_count", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      include: [{
      model: models.User,
      attributes: ['profile_picture']
      }]
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
    console.error("Get all artists error:", error);
    return res.status(500).json({ error: "Failed to fetch artists" });
  }
};

// GET /artists/:name - Get artist by name with songs and albums
const getArtistByName = async (req, res) => {
  try {
    const { name } = req.params;

    const artist = await models.Artist.findOne({
      where: { stage_name: name, deleted_at: null },
      attributes: { exclude: ["password_hash", "api_key"] },
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    // Get all songs by this artist
    const songs = await models.Song.findAll({
      where: { artist_id: artist.id, deleted_at: null },
      order: [["created_at", "DESC"]],
    });

    // Get all albums by this artist
    const albums = await models.Album.findAll({
      where: { artist_id: artist.id, deleted_at: null },
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      ...artist.toJSON(),
      songs,
      albums,
    });
  } catch (error) {
    console.error("Get artist by name error:", error);
    return res.status(500).json({ error: "Failed to fetch artist" });
  }
};

// POST /artists/register - Register new artist
const registerArtist = async (req, res) => {
  upload.single("profile_picture")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Validation
    const { error } = registerArtistSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    try {
      let {
        username,
        name,
        real_name,
        email,
        password,
        dob,
        country,
        phone,
        bio,
        gender,
        genres,
        social_links,
      } = req.body;

      // Validate required fields
      if (!username || !name || !email || !password) {
        return res
          .status(400)
          .json({ error: "Username, name, email, and password are required" });
      }

      if (!real_name) {
        real_name = name.toString();
      }

      // Check if email or username already exists
      const existingUser = await models.User.findOne({
        where: { [Op.or]: [{ email }, { username }] },
      });
      if (existingUser) {
        return res.status(409).json({ error: "Email or username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Prepare profile picture path
      let profilePicPath = null;
      if (req.file) {
        profilePicPath = req.file.path.replace(/\\/g, "/");
      }

      // Generate API key
      const apiKey = crypto.randomUUID();

      // Parse genres if it's a string
      let genresArray = [];
      if (genres) {
        if (Array.isArray(genres)) {
          genresArray = genres;
        } else if (typeof genres === "string") {
          try {
            genresArray = JSON.parse(genres);
            if (!Array.isArray(genresArray)) {
              genresArray = [genresArray];
            }
          } catch {
            genresArray = [genres];
          }
        }
      }
      // Parse social links if it's a string
      let socialLinksObj = {};
      if (social_links) {
        if (typeof social_links === "string") {
          try {
            socialLinksObj = JSON.parse(social_links);
          } catch {
            socialLinksObj = {};
          }
        } else {
          socialLinksObj = social_links;
        }
      }

      let quota = getQuotaByApiLevel("premium");

      // Start transaction
      const result = await models.sequelize.transaction(async (t) => {
        // Insert to User table
        const user = await models.User.create(
          {
            username,
            email,
            password_hash: hashedPassword,
            full_name : real_name,
            profile_picture : profilePicPath,
            date_of_birth: dob || null,
            country: country || null,
            phone: phone || null,
            bio: bio || null,
            gender: gender || null,
            role: "artist",
            streaming_quota: quota.streaming_quota,
            download_quota: quota.download_quota,
            subscription_plan_id: 1,
            subscription_expires_at:null,
            is_active: true,
            api_key: apiKey,
            api_level: "premium",
            api_quota: quota.streaming_quota,
            email_verified: 0,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction: t }
        );

        // Insert to Artist table
        const artist = await models.Artist.create(
          {
            user_id: user.id,
            stage_name: name,
            real_name: real_name || name,
            bio: bio || null,
            genre: genresArray.toString(),
            country: country || null,
            verified: 0,
            follower_count: 0,
            monthy_listeners: 0,
            created_at: new Date(),
            updated_at: new Date(),
          },
          { transaction: t }
        );

        // Remove sensitive data
        const artistData = { ...artist.toJSON() };
        delete artistData.api_key;

        return { user, artist: artistData };
      });

      return res.status(201).json({
        message: "Artist registered successfully",
        user: result.user,
        artist: result.artist,
      });
    } catch (error) {
      console.error("Register artist error:", error);
      return res.status(500).json({ error: "Registration failed" , error : error.message});
    }
  });
};

// PUT /artists/:id - Update artist profile (Artist/Admin only)
const updateArtist = async (req, res) => {
  upload.single("profile_picture")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const { name, bio, genres, social_links } = req.body;

      const artist = await Artist.findOne({
        where: { id, deleted_at: null },
      });

      if (!artist) {
        return res.status(404).json({ error: "Artist not found" });
      }

      // Check ownership for artists
      if (req.user.role === "artist" && req.user.id !== parseInt(id)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (bio !== undefined) updateData.bio = bio;
      if (genres) {
        updateData.genres =
          typeof genres === "string" ? JSON.parse(genres) : genres;
      }
      if (social_links) {
        updateData.social_links =
          typeof social_links === "string"
            ? JSON.parse(social_links)
            : social_links;
      }
      if (req.file) {
        updateData.profile_picture = req.file.path.replace(/\\/g, "/");
      }
      updateData.updated_at = new Date();

      await artist.update(updateData);

      const updatedArtist = await Artist.findByPk(id, {
        attributes: { exclude: ["password_hash", "api_key"] },
      });

      return res.status(200).json({
        message: "Artist updated successfully",
        artist: updatedArtist,
      });
    } catch (error) {
      console.error("Update artist error:", error);
      return res.status(500).json({ error: "Failed to update artist" });
    }
  });
};

// DELETE /artists/:name - Delete artist (Admin only)
const banArtist = async (req, res) => {
  try {
    const { id } = req.params;

    const artist = await models.Artist.findOne({
      where: { id, deleted_at: null },
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    await artist.update({ deleted_at: new Date() });

    return res.status(200).json({ message: "Artist banned successfully" });
  } catch (error) {
    console.error("Delete artist error:", error);
    return res.status(500).json({ error: "Failed to delete artist" });
  }
};

// POST /artists/:name/follow - Follow/unfollow artist
const toggleFollowArtist = async (req, res) => {
  try {
    const { name } = req.params;
    const userId = req.user.id;

    const artist = await models.Artist.findOne({
      where: { stage_name: name, deleted_at: null },
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const existingFollow = await models.UserFollowArtist.findOne({
      where: { user_id: userId, artist_id: artist.id },
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      await artist.increment("follower_count", { by: -1 });
      return res
        .status(200)
        .json({ message: "Artist unfollowed", following: false });
    } else {
      // Follow
      await models.UserFollowArtist.create({
        user_id: userId,
        artist_id: artist.id,
        created_at: new Date(),
      });
      await artist.increment("follower_count", { by: 1 });
      return res
        .status(200)
        .json({ message: "Artist followed", following: true });
    }
  } catch (error) {
    console.error("Toggle follow artist error:", error);
    return res.status(500).json({ error: "Failed to toggle follow" });
  }
};

// GET /artists/:name/songs - Get songs by artist
const getArtistSongs = async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const artist = await models.Artist.findOne({
      where: { stage_name: name, deleted_at: null },
    });
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const songs = await models.Song.findAndCountAll({
      where: { artist_id: artist.id, deleted_at: null },
      include: [
        {
          model: models.Album,
          as: "Album",
          attributes: ["id", "title", "cover_image"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      songs: songs.rows,
      pagination: {
        total: songs.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(songs.count / limit),
      },
    });
  } catch (error) {
    console.error("Get artist songs error:", error);
    return res.status(500).json({ error: "Failed to fetch artist songs" });
  }
};

// GET /artists/:name/albums - Get albums by artist
const getArtistAlbums = async (req, res) => {
  try {
    const { name } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const artist = await models.Artist.findOne({
      where: { stage_name: name, deleted_at: null },
    });
    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    const albums = await models.Album.findAndCountAll({
      where: { artist_id: artist.id, deleted_at: null },
      order: [["release_date", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      albums: albums.rows,
      pagination: {
        total: albums.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(albums.count / limit),
      },
    });
  } catch (error) {
    console.error("Get artist albums error:", error);
    return res.status(500).json({ error: "Failed to fetch artist albums" });
  }
};

// PUT /artists/:name/verify - Verify artist (Admin only)
const verifyArtist = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'verified', 'pending', 'rejected'

    if (!["verified", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid verification status" });
    }

    const artist = await models.Artist.findOne({
      where: { id, deleted_at: null },
    });

    if (!artist) {
      return res.status(404).json({ error: "Artist not found" });
    }

    await artist.update({
      verified: status,
      updated_at: new Date(),
    });

    return res.status(200).json({
      message: `Artist verification status updated to ${status}`,
      artist: {
        id: artist.id,
        name: artist.stage_name,
        verified: status,
      },
    });
  } catch (error) {
    console.error("Verify artist error:", error);
    return res
      .status(500)
      .json({ error: "Failed to update verification status" });
  }
};

module.exports = {
  getAllArtists,
  getArtistByName,
  registerArtist,
  updateArtist,
  banArtist,
  toggleFollowArtist,
  getArtistSongs,
  getArtistAlbums,
  verifyArtist,
  upload,
};
