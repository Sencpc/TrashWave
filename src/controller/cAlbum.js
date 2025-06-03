const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Album, Artist, Song, UserLikeAlbum } = require("../Model/mIndex");
const SpotifyAPI = require("../utils/spotifyAPI");

// Multer storage config for album cover images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `storage/albums/covers`;
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const timestamp = Date.now();
    cb(null, `cover_${timestamp}${ext}`);
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

// GET /albums - Get all albums with pagination and filters
const getAllAlbums = async (req, res) => {
  try {
    const { page = 1, limit = 20, artist_id, genre, search } = req.query;
    const offset = (page - 1) * limit;

    const where = { deleted_at: null };
    if (artist_id) where.artist_id = artist_id;
    if (genre) where.genre = genre;
    if (search) {
      where[Album.sequelize.Op.or] = [
        { title: { [Album.sequelize.Op.iLike]: `%${search}%` } },
        { description: { [Album.sequelize.Op.iLike]: `%${search}%` } },
      ];
    }

    const albums = await Album.findAndCountAll({
      where,
      include: [
        {
          model: Artist,
          as: "artist",
          attributes: ["id", "name", "profile_picture", "verification_status"],
        },
      ],
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
    console.error("Get all albums error:", error);
    return res.status(500).json({ error: "Failed to fetch albums" });
  }
};

// GET /albums/:id - Get album by ID with songs
const getAlbumById = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findOne({
      where: { id, deleted_at: null },
      include: [
        {
          model: Artist,
          as: "artist",
          attributes: ["id", "name", "profile_picture", "verification_status"],
        },
        {
          model: Song,
          as: "songs",
          where: { deleted_at: null },
          required: false,
          order: [["track_number", "ASC"]],
        },
      ],
    });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    return res.status(200).json(album);
  } catch (error) {
    console.error("Get album by ID error:", error);
    return res.status(500).json({ error: "Failed to fetch album" });
  }
};

// POST /albums - Create new album (Artist/Admin only)
const createAlbum = async (req, res) => {
  upload.single("cover_image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { title, description, genre, release_date } = req.body;

      // Validate required fields
      if (!title || !genre) {
        return res.status(400).json({ error: "Title and genre are required" });
      }

      let coverImagePath = null;
      if (req.file) {
        coverImagePath = req.file.path.replace(/\\/g, "/");
      }

      const album = await Album.create({
        title,
        artist_id:
          req.user.role === "artist" ? req.user.id : req.body.artist_id,
        description: description || null,
        genre,
        cover_image: coverImagePath,
        release_date: release_date || new Date(),
        total_tracks: 0,
        total_duration: 0,
        like_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const albumWithDetails = await Album.findByPk(album.id, {
        include: [
          {
            model: Artist,
            as: "artist",
            attributes: [
              "id",
              "name",
              "profile_picture",
              "verification_status",
            ],
          },
        ],
      });

      return res.status(201).json({
        message: "Album created successfully",
        album: albumWithDetails,
      });
    } catch (error) {
      console.error("Create album error:", error);
      return res.status(500).json({ error: "Failed to create album" });
    }
  });
};

// PUT /albums/:id - Update album (Artist/Admin only)
const updateAlbum = async (req, res) => {
  upload.single("cover_image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const { title, description, genre, release_date } = req.body;

      const album = await Album.findOne({
        where: { id, deleted_at: null },
      });

      if (!album) {
        return res.status(404).json({ error: "Album not found" });
      }

      // Check ownership for artists
      if (req.user.role === "artist" && album.artist_id !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateData = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (genre) updateData.genre = genre;
      if (release_date) updateData.release_date = release_date;
      if (req.file) {
        updateData.cover_image = req.file.path.replace(/\\/g, "/");
      }
      updateData.updated_at = new Date();

      await album.update(updateData);

      const updatedAlbum = await Album.findByPk(id, {
        include: [
          {
            model: Artist,
            as: "artist",
            attributes: [
              "id",
              "name",
              "profile_picture",
              "verification_status",
            ],
          },
        ],
      });

      return res.status(200).json({
        message: "Album updated successfully",
        album: updatedAlbum,
      });
    } catch (error) {
      console.error("Update album error:", error);
      return res.status(500).json({ error: "Failed to update album" });
    }
  });
};

// DELETE /albums/:id - Delete album (Artist/Admin only)
const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findOne({
      where: { id, deleted_at: null },
    });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    // Check ownership for artists
    if (req.user.role === "artist" && album.artist_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Soft delete album and its songs
    await album.update({ deleted_at: new Date() });
    await Song.update({ deleted_at: new Date() }, { where: { album_id: id } });

    return res.status(200).json({ message: "Album deleted successfully" });
  } catch (error) {
    console.error("Delete album error:", error);
    return res.status(500).json({ error: "Failed to delete album" });
  }
};

// POST /albums/:id/like - Like/unlike album
const toggleLikeAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const album = await Album.findOne({
      where: { id, deleted_at: null },
    });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    const existingLike = await UserLikeAlbum.findOne({
      where: { user_id: userId, album_id: id },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await album.increment("like_count", { by: -1 });
      return res.status(200).json({ message: "Album unliked", liked: false });
    } else {
      // Like
      await UserLikeAlbum.create({
        user_id: userId,
        album_id: id,
        created_at: new Date(),
      });
      await album.increment("like_count", { by: 1 });
      return res.status(200).json({ message: "Album liked", liked: true });
    }
  } catch (error) {
    console.error("Toggle like album error:", error);
    return res.status(500).json({ error: "Failed to toggle like" });
  }
};

// GET /albums/:id/songs - Get songs in album
const getAlbumSongs = async (req, res) => {
  try {
    const { id } = req.params;

    const album = await Album.findByPk(id);
    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    const songs = await Song.findAll({
      where: { album_id: id, deleted_at: null },
      include: [
        {
          model: Artist,
          as: "artist",
          attributes: ["id", "name", "profile_picture"],
        },
      ],
      order: [["track_number", "ASC"]],
    });

    return res.status(200).json({ songs });
  } catch (error) {
    console.error("Get album songs error:", error);
    return res.status(500).json({ error: "Failed to fetch album songs" });
  }
};

// POST /albums/:id/songs/:songId - Add song to album
const addSongToAlbum = async (req, res) => {
  try {
    const { id, songId } = req.params;
    const { track_number } = req.body;

    const album = await Album.findOne({
      where: { id, deleted_at: null },
    });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    // Check ownership for artists
    if (req.user.role === "artist" && album.artist_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const song = await Song.findOne({
      where: { id: songId, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Check if song belongs to same artist
    if (song.artist_id !== album.artist_id) {
      return res
        .status(400)
        .json({ error: "Song must belong to the same artist" });
    }

    // Update song's album
    await song.update({
      album_id: id,
      track_number: track_number || null,
    });

    // Update album stats
    await updateAlbumStats(id);

    return res
      .status(200)
      .json({ message: "Song added to album successfully" });
  } catch (error) {
    console.error("Add song to album error:", error);
    return res.status(500).json({ error: "Failed to add song to album" });
  }
};

// DELETE /albums/:id/songs/:songId - Remove song from album
const removeSongFromAlbum = async (req, res) => {
  try {
    const { id, songId } = req.params;

    const album = await Album.findOne({
      where: { id, deleted_at: null },
    });

    if (!album) {
      return res.status(404).json({ error: "Album not found" });
    }

    // Check ownership for artists
    if (req.user.role === "artist" && album.artist_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    const song = await Song.findOne({
      where: { id: songId, album_id: id, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found in this album" });
    }

    // Remove song from album
    await song.update({
      album_id: null,
      track_number: null,
    });

    // Update album stats
    await updateAlbumStats(id);

    return res
      .status(200)
      .json({ message: "Song removed from album successfully" });
  } catch (error) {
    console.error("Remove song from album error:", error);
    return res.status(500).json({ error: "Failed to remove song from album" });
  }
};

// Helper function to update album statistics
const updateAlbumStats = async (albumId) => {
  try {
    const songs = await Song.findAll({
      where: { album_id: albumId, deleted_at: null },
    });

    const totalTracks = songs.length;
    const totalDuration = songs.reduce((sum, song) => sum + song.duration, 0);

    await Album.update(
      {
        total_tracks: totalTracks,
        total_duration: totalDuration,
        updated_at: new Date(),
      },
      { where: { id: albumId } }
    );
  } catch (error) {
    console.error("Update album stats error:", error);
  }
};

// GET /albums/search/spotify - Search albums on Spotify
const searchSpotifyAlbums = async (req, res) => {
  try {
    const { query, limit = 20, offset = 0, market } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await SpotifyAPI.searchAlbums(query, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      market,
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Spotify album search error:", error);
    return res.status(500).json({ error: "Failed to search Spotify albums" });
  }
};

// GET /albums/spotify/:albumId - Get Spotify album details
const getSpotifyAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { market } = req.query;

    if (!albumId) {
      return res.status(400).json({ error: "Album ID is required" });
    }

    const album = await SpotifyAPI.getAlbum(albumId, market);

    return res.status(200).json(album);
  } catch (error) {
    console.error("Get Spotify album error:", error);
    return res.status(500).json({ error: "Failed to get album from Spotify" });
  }
};

// GET /albums/spotify/albums/:albumIds - Get multiple Spotify albums
const getSpotifyAlbums = async (req, res) => {
  try {
    const { albumIds } = req.params;
    const { market } = req.query;

    if (!albumIds) {
      return res.status(400).json({ error: "Album IDs are required" });
    }

    const albums = await SpotifyAPI.getAlbums(albumIds, market);

    return res.status(200).json({ albums });
  } catch (error) {
    console.error("Get Spotify albums error:", error);
    return res.status(500).json({ error: "Failed to get albums from Spotify" });
  }
};

module.exports = {
  getAllAlbums,
  getAlbumById,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  toggleLikeAlbum,
  getAlbumSongs,
  addSongToAlbum,
  removeSongFromAlbum,
  searchSpotifyAlbums,
  getSpotifyAlbum,
  getSpotifyAlbums,
  upload,
};
