const { Op, Sequelize } = require('sequelize');
const Playlist = require('../Model/mPlaylist');

// GET /playlist - Mendapatkan semua playlist
const getAllPlaylist = async (req, res) => {
  try {
    const playlists = await Playlist.findAll({
      where: { deleted_at: null },
      order: [['id', 'DESC']],
    });
    if (!playlists || playlists.length === 0) {
      return res.status(404).json({ msg: 'Tidak ada data playlist' });
    }
    return res.status(200).json(playlists);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// GET /playlist/:playlistId - Mendapatkan playlist tertentu berdasarkan ID
const getPlaylistById = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const playlist = await Playlist.findOne({
      where: { id: playlistId, deleted_at: null },
    });
    if (!playlist) {
      return res.status(404).json({ msg: 'Playlist tidak ditemukan' });
    }
    return res.status(200).json(playlist);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

// POST /playlists - Membuat playlist baru (hanya user biasa)
const createPlaylist = async (req, res) => {
  try {
    const { name, description, cover_image, is_public, is_official } = req.body;
    // user_id diambil dari req.user (hasil autentikasi)
    // const user_id = req.user.id;
    const newPlaylist = await Playlist.create({
      name,
      description,
      user_id,
      cover_image,
      is_public: is_public ?? true,
      is_official: is_official ?? false,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return res.status(201).json(newPlaylist);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};

module.exports = {
  getAllPlaylist,
  getPlaylistById,
  createPlaylist,
};
