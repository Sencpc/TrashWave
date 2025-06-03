const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const {
  Song,
  Artist,
  Album,
  UserLikeSong,
  UserDownload,
  User,
} = require("../Model/mIndex");
const SpotifyAPI = require("../utils/SpotifyAPI");

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
    fileSize: 5 * 1024 * 1024, // 5MB max file size
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
    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { deleted_at: null };
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { lyrics: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const songs = await Song.findAndCountAll({
      where,
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
          attributes: ["id", "stage_name", "real_name"],
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
      } = req.body; // Validate required fields
      if (!title || !duration || !req.files?.audio_file) {
        return res.status(400).json({
          error: "Title, duration, and audio file are required",
        });
      }

      // Check if album exists
      if (album_id) {
        const album = await Album.findByPk(album_id);
        if (!album) {
          return res.status(404).json({ error: "Album not found" });
        }
      } // Get artist_id - if user is an artist, find their artist record
      let artistId;
      if (req.user.ROLE === "artist") {
        const artist = await Artist.findOne({
          where: { user_id: req.user.id },
        });
        if (!artist) {
          return res.status(404).json({ error: "Artist profile not found" });
        }
        artistId = artist.id;
      } else if (req.user.ROLE === "admin" && req.body.artist_id) {
        artistId = req.body.artist_id;
      } else {
        return res.status(403).json({ error: "Only artists can create songs" });
      }

      const audioFile = req.files.audio_file[0];
      const coverImage = req.files.cover_image?.[0];

      const song = await Song.create({
        title,
        artist_id: artistId,
        album_id: album_id || null,
        file_url: audioFile.path.replace(/\\/g, "/"),
        duration_seconds: parseInt(duration),
        lyrics: lyrics || null,
        is_explicit: explicit_content === "true",
        release_date: release_date || new Date(),
        play_count: 0,
        like_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });
      const songWithDetails = await Song.findByPk(song.id, {
        include: [
          {
            model: Artist,
            as: "artist",
            attributes: ["id", "stage_name", "real_name"],
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
    const { title, album_id, duration, lyrics, explicit_content } = req.body;
    const song = await Song.findOne({
      where: { id, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Check ownership for artists
    if (req.user.ROLE === "artist") {
      const artist = await Artist.findOne({ where: { user_id: req.user.id } });
      if (!artist || song.artist_id !== artist.id) {
        return res.status(403).json({ error: "Access denied" });
      }
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (album_id !== undefined) updateData.album_id = album_id;
    if (duration) updateData.duration_seconds = parseInt(duration);
    if (lyrics !== undefined) updateData.lyrics = lyrics;
    if (explicit_content !== undefined)
      updateData.is_explicit = explicit_content === "true";
    updateData.updated_at = new Date();

    await song.update(updateData);
    const updatedSong = await Song.findByPk(id, {
      include: [
        {
          model: Artist,
          as: "artist",
          attributes: ["id", "stage_name", "real_name"],
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
    } // Check ownership for artists
    if (req.user.ROLE === "artist") {
      const artist = await Artist.findOne({ where: { user_id: req.user.id } });
      if (!artist || song.artist_id !== artist.id) {
        return res.status(403).json({ error: "Access denied" });
      }
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
      });
      await song.increment("like_count", { by: 1 });
      return res.status(200).json({ message: "Song liked", liked: true });
    }
  } catch (error) {
    console.error("Toggle like song error:", error);
    return res.status(500).json({ error: "Failed to toggle like" });
  }
};

// POST /songs/:id/play - Increment play count and decrement streaming quota
const playSong = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const song = await Song.findOne({
      where: { id, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "User account is inactive" });
    }

    if (user.api_level !== "premium" && user.api_level !== "premium_lite") {
      if (user.streaming_quota <= 0) {
        return res.status(403).json({
          error:
            "Streaming quota exceeded. Upgrade to premium for unlimited streaming.",
        });
      }

      // Decrement streaming quota for non-premium active users
      await user.decrement("streaming_quota", { by: 1 });
    }

    // Increment play count
    await song.increment("play_count", { by: 1 });

    // Prepare response data
    const responseData = {
      message: "Play count updated",
      play_count: song.play_count + 1,
    };

    // Add quota info for non-premium users
    if (user.is_active && user.api_level !== "premium") {
      responseData.remaining_quota = user.streaming_quota - 1;
      responseData.api_level = user.api_level;
    }

    return res.status(200).json(responseData);
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

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: "User account is inactive" });
    }

    if (user.api_level !== "premium") {
      if (user.download_quota <= 0) {
        return res.status(403).json({
          error:
            "download quota exceeded. Upgrade to premium for unlimited download.",
        });
      }

      await user.decrement("download_quota", { by: 1 });
    }

    const song = await Song.findOne({
      where: { id, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }
    await UserDownload.create({
      user_id: userId,
      song_id: id,
    });

    // Update song download count (using existing like_count field as proxy)
    await song.increment("like_count", { by: 1 });

    // Prepare response data
    const responseData = {
      message: "Song download recorded",
      download_url: `/api/v1/songs/${id}/file`,
    };

    // Add quota info for non-premium users
    if (user.api_level !== "premium") {
      responseData.remaining_quota = user.download_quota - 1;
      responseData.api_level = user.api_level;
    }

    return res.status(200).json(responseData);
  } catch (error) {
    console.error("Download song error:", error);
    return res.status(500).json({ error: "Failed to download song" });
  }
};

// GET /songs/search/spotify - Search songs on Spotify
const searchSpotify = async (req, res) => {
  try {
    const { query, limit = 20, offset = 0, market } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await SpotifyAPI.searchTracks(query, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      market,
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Spotify search error:", error);
    return res.status(500).json({ error: "Failed to search Spotify" });
  }
};

// GET /songs/spotify/:trackId - Get Spotify track details
const getSpotifyTrack = async (req, res) => {
  try {
    const { trackId } = req.params;
    const { market } = req.query;

    if (!trackId) {
      return res.status(400).json({ error: "Track ID is required" });
    }

    const track = await SpotifyAPI.getTrack(trackId, market);

    return res.status(200).json(track);
  } catch (error) {
    console.error("Get Spotify track error:", error);
    return res.status(500).json({ error: "Failed to get track from Spotify" });
  }
};

// GET /songs/spotify/tracks/:trackIds - Get multiple Spotify tracks
const getSpotifyTracks = async (req, res) => {
  try {
    const { trackIds } = req.params;
    const { market } = req.query;

    if (!trackIds) {
      return res.status(400).json({ error: "Track IDs are required" });
    }

    const tracks = await SpotifyAPI.getTracks(trackIds, market);

    return res.status(200).json({ tracks });
  } catch (error) {
    console.error("Get Spotify tracks error:", error);
    return res.status(500).json({ error: "Failed to get tracks from Spotify" });
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
  getSpotifyTrack,
  getSpotifyTracks,
  upload,
};
