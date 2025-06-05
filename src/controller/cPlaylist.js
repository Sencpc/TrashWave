const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
const {
  Playlist,
  PlaylistSong,
  Song,
  Artist,
  User,
  UserLikePlaylist,
} = require("../Model/mIndex");
const SpotifyAPI = require("../utils/spotifyAPI");

// Multer storage config for playlist cover images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = `storage/playlists/covers`;
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

// GET /playlists - Get all playlists with pagination and filters
const getAllPlaylist = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      user_id,
      is_public,
      is_official,
    } = req.query;
    const offset = (page - 1) * limit;

    const where = { deleted_at: null };
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (user_id) where.user_id = user_id;
    if (is_public !== undefined) where.is_public = is_public === "true";
    if (is_official !== undefined) where.is_official = is_official === "true";

    const playlists = await Playlist.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: "User", // perbaiki alias
          attributes: ["id", "username", "profile_picture"],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      playlists: playlists.rows,
      pagination: {
        total: playlists.count,
        page: parseInt(page),
        totalPages: Math.ceil(playlists.count / limit),
      },
    });
  } catch (error) {
    console.error("Get all playlists error:", error);
    return res.status(500).json({ error: "Failed to fetch playlists" });
  }
};

// GET /playlists/:name - Get playlist by name with songs
const getPlaylistByName = async (req, res) => {
  try {
    const { name } = req.params;

    const playlist = await Playlist.findOne({
      where: { 
        name: name,
        deleted_at: null 
      },
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "username", "profile_picture"],
        },
        {
          model: PlaylistSong,
          as: "PlaylistSongs", // perbaiki alias agar sesuai dengan relasi di model
          include: [
            {
              model: Song,
              as: "Song", // perbaiki alias agar sesuai dengan relasi di model
              where: { deleted_at: null },
              required: false,
              include: [
                {
                  model: Artist,
                  as: "artist", // Fixed: use lowercase 'artist' to match the association alias
                  attributes: ["id", "stage_name"],
                },
              ],
            },
          ],
          order: [["position", "ASC"]],
        },
      ],
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Check if playlist is private and user has access
    if (!playlist.is_public && req.user && playlist.user_id !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Access denied to private playlist" });
    }

    return res.status(200).json(playlist);
  } catch (error) {
    console.error("Get playlist by ID error:", error);
    return res.status(500).json({ error: "Failed to fetch playlist" });
  }
};

// POST /playlists - Create new playlist
const createPlaylist = async (req, res) => {
  upload.single("cover_image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { name, description, is_public } = req.body;

      // Validate required fields
      if (!name) {
        return res.status(400).json({ error: "Playlist name is required" });
      }

      let coverImagePath = null;
      if (req.file) {
        coverImagePath = req.file.path.replace(/\\/g, "/");
      }

      console.log({
        name,
        description: description || null,
        user_id: req.user.id,
        cover_image: coverImagePath,
        is_public: is_public !== undefined ? is_public === "true" : true,
        is_official: false,
        song_count: 0,
        total_duration: 0,
        like_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const playlist = await Playlist.create({
        name,
        description: description || null,
        user_id: req.user.id,
        cover_image: coverImagePath,
        is_public: is_public !== undefined ? is_public === "true" : true,
        is_official: false, // Only admin can set this, but only 'user' can create
        song_count: 0,
        total_duration: 0,
        like_count: 0,
        created_at: new Date(),
        updated_at: new Date(),
      });

      const playlistWithDetails = await Playlist.findByPk(playlist.id, {
        include: [
          {
            model: User,
            as: "User", // Sesuaikan alias dengan yang ada di model
            attributes: ["id", "username", "profile_picture"],
          },
        ],
      });

      return res.status(201).json({
        message: "Playlist created successfully",
        playlist: playlistWithDetails,
      });
    } catch (error) {
      console.error("Create playlist error:", error);
      return res.status(500).json({ error: "Failed to create playlist" });
    }
  });
};

// PUT /playlists/:id - Update playlist
const updatePlaylist = async (req, res) => {
  upload.single("cover_image")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const { id } = req.params;
      const { name, description, is_public, is_official } = req.body;

      const playlist = await Playlist.findOne({
        where: { id, deleted_at: null },
      });

      if (!playlist) {
        return res.status(404).json({ error: "Playlist not found" });
      }

      // Check ownership (users can only edit their own playlists, admins can edit any)
      if (req.user.role !== "admin" && playlist.user_id !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (is_public !== undefined) updateData.is_public = is_public === "true";
      if (is_official !== undefined && req.user.role === "admin") {
        updateData.is_official = is_official === "true";
      }
      if (req.file) {
        updateData.cover_image = req.file.path.replace(/\\/g, "/");
      }
      updateData.updated_at = new Date();

      await playlist.update(updateData);

      const updatedPlaylist = await Playlist.findByPk(id, {
        include: [
          {
            model: User,
            as: "User",
            attributes: ["id", "username", "profile_picture"],
          },
        ],
      });

      return res.status(200).json({
        message: "Playlist updated successfully",
        playlist: updatedPlaylist,
      });
    } catch (error) {
      console.error("Update playlist error:", error);
      return res.status(500).json({ error: "Failed to update playlist" });
    }
  });
};

// DELETE /playlists/:id - Delete playlist
const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findOne({
      where: { id, deleted_at: null },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Check ownership (users can only delete their own playlists, admins can delete any)
    if (req.user.role !== "admin" && playlist.user_id !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await playlist.update({ deleted_at: new Date() });

    return res.status(200).json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Delete playlist error:", error);
    return res.status(500).json({ error: "Failed to delete playlist" });
  }
};

// POST /playlists/:id/like - Like/unlike playlist
const toggleLikePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findOne({
      where: { id, deleted_at: null },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const existingLike = await UserLikePlaylist.findOne({
      where: { user_id: userId, playlist_id: id },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await playlist.increment("like_count", { by: -1 });
      return res
        .status(200)
        .json({ message: "Playlist unliked", liked: false });
    } else {
      // Like
      await UserLikePlaylist.create({
        user_id: userId,
        playlist_id: id,
        created_at: new Date(),
      });
      await playlist.increment("like_count", { by: 1 });
      return res.status(200).json({ message: "Playlist liked", liked: true });
    }
  } catch (error) {
    console.error("Toggle like playlist error:", error);
    return res.status(500).json({ error: "Failed to toggle like" });
  }
};

// POST /playlists/:id/songs - Add song to playlist
const addSongToPlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { song_name, position } = req.body;

    const playlist = await Playlist.findOne({
      where: { id, deleted_at: null },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Check ownership
    if (playlist.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Cari lagu berdasarkan judul (title)
    const song = await Song.findOne({
      where: { title: song_name, deleted_at: null },
    });

    if (!song) {
      return res.status(404).json({ error: "Song not found" });
    }

    // Check if song is already in playlist
    const existingEntry = await PlaylistSong.findOne({
      where: { playlist_id: id, song_id: song.id },
    });

    if (existingEntry) {
      return res.status(409).json({ error: "Song already in playlist" });
    }

    // Get next position if not provided
    let nextPosition = position;
    if (!nextPosition) {
      const lastSong = await PlaylistSong.findOne({
        where: { playlist_id: id },
        order: [["position", "DESC"]],
      });
      nextPosition = lastSong ? lastSong.position + 1 : 1;
    }

    await PlaylistSong.create({
      playlist_id: id,
      song_id: song.id,
      position: nextPosition,
      added_at: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Update playlist stats
    await updatePlaylistStats(id);

    return res
      .status(200)
      .json({ message: "Song added to playlist successfully" });
  } catch (error) {
    console.error("Add song to playlist error:", error);
    return res.status(500).json({ error: "Failed to add song to playlist" });
  }
};

// DELETE /playlists/:id/songs/:songId - Remove song from playlist
const removeSongFromPlaylist = async (req, res) => {
  try {
    const { id, songId } = req.params;

    const playlist = await Playlist.findOne({
      where: { id, deleted_at: null },
    });

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    // Check ownership
    if (playlist.user_id !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const playlistSong = await PlaylistSong.findOne({
      where: { playlist_id: id, song_id: songId },
    });

    if (!playlistSong) {
      return res.status(404).json({ error: "Song not found in playlist" });
    }

    await playlistSong.destroy();

    // Reorder remaining songs
    await reorderPlaylistSongs(id);

    // Update playlist stats
    await updatePlaylistStats(id);

    return res
      .status(200)
      .json({ message: "Song removed from playlist successfully" });
  } catch (error) {
    console.error("Remove song from playlist error:", error);
    return res
      .status(500)
      .json({ error: "Failed to remove song from playlist" });
  }
};

// Helper function to reorder playlist songs after removal
const reorderPlaylistSongs = async (playlistId) => {
  try {
    const playlistSongs = await PlaylistSong.findAll({
      where: { playlist_id: playlistId },
      order: [["position", "ASC"]],
    });

    // Update positions to be sequential starting from 1
    for (let i = 0; i < playlistSongs.length; i++) {
      await playlistSongs[i].update({
        position: i + 1,
        updated_at: new Date(),
      });
    }
  } catch (error) {
    console.error("Reorder playlist songs error:", error);
  }
};

// Helper function to update playlist statistics
const updatePlaylistStats = async (playlistId) => {
  try {
    const playlistSongs = await PlaylistSong.findAll({
      where: { playlist_id: playlistId },
      include: [
        {
          model: Song,
          as: "Song", // Fixed: use 'Song' to match the default association alias
          where: { deleted_at: null },
          required: false,
        },
      ],
    });

    const songCount = playlistSongs.length;
    const totalDuration = playlistSongs.reduce(
      (sum, ps) => sum + (ps.Song ? ps.Song.duration_seconds : 0), // Fixed: use Song and duration_seconds
      0
    );

    await Playlist.update(
      {
        song_count: songCount,
        total_duration: totalDuration,
        updated_at: new Date(),
      },
      { where: { id: playlistId } }
    );
  } catch (error) {
    console.error("Update playlist stats error:", error);
  }
};

// GET /playlists/search/spotify - Search playlists on Spotify
const searchSpotifyPlaylists = async (req, res) => {
  try {
    const { query, limit = 20, offset = 0, market } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await SpotifyAPI.searchPlaylists(query, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      market,
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Spotify playlist search error:", error);
    return res
      .status(500)
      .json({ error: "Failed to search Spotify playlists" });
  }
};

// GET /playlists/spotify/:playlistId - Get Spotify playlist details
const getSpotifyPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { market, fields, additional_types } = req.query;

    if (!playlistId) {
      return res.status(400).json({ error: "Playlist ID is required" });
    }

    const options = {};
    if (market) options.market = market;
    if (fields) options.fields = fields;
    if (additional_types) options.additional_types = additional_types;

    const playlist = await SpotifyAPI.getPlaylist(playlistId, options);

    return res.status(200).json(playlist);
  } catch (error) {
    console.error("Get Spotify playlist error:", error);
    return res
      .status(500)
      .json({ error: "Failed to get playlist from Spotify" });
  }
};

// GET /playlists/spotify/search/multiple - Search multiple content types on Spotify
const searchSpotifyMultiple = async (req, res) => {
  try {
    const {
      query,
      types = "track,album,artist,playlist",
      limit = 20,
      offset = 0,
      market,
    } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await SpotifyAPI.searchMultiple(query, types, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      market,
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Spotify multiple search error:", error);
    return res.status(500).json({ error: "Failed to search Spotify" });
  }
};

module.exports = {
  getAllPlaylist,
  getPlaylistByName,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  toggleLikePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  searchSpotifyPlaylists,
  getSpotifyPlaylist,
  searchSpotifyMultiple,
  upload,
};
