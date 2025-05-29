const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Song = require("../Model/mSong");
const Artist = require("../Model/mArtist");
const Album = require("../Model/mAlbum");
const UserLikeSong = require("../Model/mUserLikeSong");
const UserDownload = require("../Model/mUserDownload");
const SpotifyAPI = require("../utils/spotifyAPI");

// Multer storage config for song files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder =
      file.fieldname === "cover_image"
        ? `storage/songs/covers`
        : `storage/songs/audio`;
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    const name =
      file.fieldname === "cover_image"
        ? `cover_${timestamp}${ext}`
        : `audio_${timestamp}${ext}`;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: (file) =>
      file.fieldname === "cover_image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024, // 5MB for images, 50MB for audio
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "cover_image") {
      const allowed = /jpeg|jpg|png/;
      const ext = path.extname(file.originalname).toLowerCase();
      const mime = file.mimetype;
      if (allowed.test(ext) && allowed.test(mime)) {
        cb(null, true);
      } else {
        cb(new Error("Only jpeg, jpg, png allowed for cover image"));
      }
    } else if (file.fieldname === "audio_file") {
      const allowed = /mp3|wav|flac|m4a/;
      const ext = path.extname(file.originalname).toLowerCase();
      if (allowed.test(ext)) {
        cb(null, true);
      } else {
        cb(new Error("Only mp3, wav, flac, m4a allowed for audio"));
      }
    } else {
      cb(new Error("Unexpected field"));
    }
  },
});

// GET /songs - Get all songs with pagination and filters
const getAllSongs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      genre,
      artist_id,
      album_id,
      search,
    } = req.query;
    const offset = (page - 1) * limit;

    const where = { deleted_at: null };
    if (genre) where.genre = genre;
    if (artist_id) where.artist_id = artist_id;
    if (album_id) where.album_id = album_id;
    if (search) {
      where[Song.sequelize.Op.or] = [
        { title: { [Song.sequelize.Op.iLike]: `%${search}%` } },
        { lyrics: { [Song.sequelize.Op.iLike]: `%${search}%` } },
      ];
    }

    const songs = await Song.findAndCountAll({
      where,
      include: [
        {
          model: Artist,
          as: "artist",
          attributes: ["id", "name", "profile_picture"],
        },
        {
          model: Album,
          as: "album",
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
    console.error("Get all songs error:", error);
    return res.status(500).json({ error: "Failed to fetch songs" });
  }
};

// GET /songs/:id - Get song by ID
const getSongById = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await Song.findOne({
      where: { id, deleted_at: null },
      include: [
        {
          model: Artist,
          as: "artist",
          attributes: ["id", "name", "profile_picture"],
        },
        {
          model: Album,
          as: "album",
          attributes: ["id", "title", "cover_image"],
        },
      ],
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    return res.status(200).json(song);
  } catch (error) {
    console.error("Get song by ID error:", error);
    return res.status(500).json({ error: "Failed to fetch song" });
  }
};

// POST /songs - Create new song (Artist/Admin only)
const createSong = async (req, res) => {
  upload.fields([
    { name: "audio_file", maxCount: 1 },
    { name: "cover_image", maxCount: 1 },
  ])(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const {
        title,
        album_id,
        genre,
        duration,
        lyrics,
        explicit_content,
        release_date,
      } = req.body;

      // Validate required fields
      if (!title || !genre || !duration || !req.files?.audio_file) {
        return res.status(400).json({
          error: "Title, genre, duration, and audio file are required",
        });
      }

      // Check if album exists
      if (album_id) {
        const album = await Album.findByPk(album_id);
        if (!album) {
          return res.status(404).json({ error: "Album not found" });
        }
      }

      const audioFile = req.files.audio_file[0];
      const coverImage = req.files.cover_image?.[0];

      const song = await Song.create({
        title,
        artist_id:
          req.user.role === "artist" ? req.user.id : req.body.artist_id,
        album_id: album_id || null,
        genre,
        duration: parseInt(duration),
        file_path: audioFile.path.replace(/\\/g, "/"),
        cover_image: coverImage ? coverImage.path.replace(/\\/g, "/") : null,
        lyrics: lyrics || null,
        explicit_content: explicit_content === "true",
        release_date: release_date || new Date(),
        play_count: 0,
        like_count: 0,
        download_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const songWithDetails = await Song.findByPk(song.id, {
        include: [
          {
            model: Artist,
            as: "artist",
            attributes: ["id", "name", "profile_picture"],
          },
          {
            model: Album,
            as: "album",
            attributes: ["id", "title", "cover_image"],
          },
        ],
      });

      return res
        .status(201)
        .json({ message: "Song created successfully", song: songWithDetails });
    } catch (error) {
      console.error("Create song error:", error);
      return res.status(500).json({ error: "Failed to create song" });
    }
  });
};

// PUT /songs/:id - Update song (Artist/Admin only)
const updateSong = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, album_id, genre, duration, lyrics, explicit_content } =
      req.body;

    const song = await Song.findOne({
      where: { id, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Check ownership for artists
    if (req.user.role === "artist" && song.artist_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (album_id !== undefined) updateData.album_id = album_id;
    if (genre) updateData.genre = genre;
    if (duration) updateData.duration = parseInt(duration);
    if (lyrics !== undefined) updateData.lyrics = lyrics;
    if (explicit_content !== undefined)
      updateData.explicit_content = explicit_content === "true";
    updateData.updated_at = new Date();

    await song.update(updateData);

    const updatedSong = await Song.findByPk(id, {
      include: [
        {
          model: Artist,
          as: "artist",
          attributes: ["id", "name", "profile_picture"],
        },
        {
          model: Album,
          as: "album",
          attributes: ["id", "title", "cover_image"],
        },
      ],
    });

    return res
      .status(200)
      .json({ message: "Song updated successfully", song: updatedSong });
  } catch (error) {
    console.error("Update song error:", error);
    return res.status(500).json({ error: "Failed to update song" });
  }
};

// DELETE /songs/:id - Delete song (Artist/Admin only)
const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await Song.findOne({
      where: { id, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Check ownership for artists
    if (req.user.role === "artist" && song.artist_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await song.update({ deleted_at: new Date() });

    return res.status(200).json({ message: "Song deleted successfully" });
  } catch (error) {
    console.error("Delete song error:", error);
    return res.status(500).json({ error: "Failed to delete song" });
  }
};

// POST /songs/:id/like - Like/unlike song
const toggleLikeSong = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const song = await Song.findOne({
      where: { id, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    const existingLike = await UserLikeSong.findOne({
      where: { user_id: userId, song_id: id },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await song.increment("like_count", { by: -1 });
      return res.status(200).json({ message: "Song unliked", liked: false });
    } else {
      // Like
      await UserLikeSong.create({
        user_id: userId,
        song_id: id,
        created_at: new Date(),
      });
      await song.increment("like_count", { by: 1 });
      return res.status(200).json({ message: "Song liked", liked: true });
    }
  } catch (error) {
    console.error("Toggle like song error:", error);
    return res.status(500).json({ error: "Failed to toggle like" });
  }
};

// POST /songs/:id/play - Increment play count
const playSong = async (req, res) => {
  try {
    const { id } = req.params;

    const song = await Song.findOne({
      where: { id, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    await song.increment("play_count", { by: 1 });

    return res.status(200).json({ message: "Play count updated" });
  } catch (error) {
    console.error("Play song error:", error);
    return res.status(500).json({ error: "Failed to update play count" });
  }
};

// POST /songs/:id/download - Download song (Premium users only)
const downloadSong = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user has premium subscription
    if (req.user.subscription_plan === "free") {
      return res
        .status(403)
        .json({ error: "Premium subscription required for downloads" });
    }

    const song = await Song.findOne({
      where: { id, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Check download quota
    if (req.user.download_quota <= 0) {
      return res.status(403).json({ error: "Download quota exceeded" });
    }

    // Record download
    await UserDownload.create({
      user_id: userId,
      song_id: id,
      download_date: new Date(),
    });

    // Update download count and user quota
    await song.increment("download_count", { by: 1 });
    await req.user.decrement("download_quota", { by: 1 });

    return res.status(200).json({
      message: "Song download recorded",
      download_url: `/api/v1/songs/${id}/file`,
      remaining_quota: req.user.download_quota - 1,
    });
  } catch (error) {
    console.error("Download song error:", error);
    return res.status(500).json({ error: "Failed to download song" });
  }
};

// GET /songs/search/spotify - Search songs on Spotify
const searchSpotify = async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const spotify = new SpotifyAPI();
    const results = await spotify.searchTracks(query, limit);

    return res.status(200).json(results);
  } catch (error) {
    console.error("Spotify search error:", error);
    return res.status(500).json({ error: "Failed to search Spotify" });
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  createSong,
  updateSong,
  deleteSong,
  toggleLikeSong,
  playSong,
  downloadSong,
  searchSpotify,
  upload,
};
