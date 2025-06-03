const SpotifyAPI = require("../utils/SpotifyAPI");

// GET /spotify/search - Universal Spotify search
const searchSpotify = async (req, res) => {
  try {
    const {
      query,
      types = "track,album,artist,playlist",
      limit = 20,
      offset = 0,
      market,
      include_external,
    } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    if (market) options.market = market;
    if (include_external) options.include_external = include_external;

    const results = await SpotifyAPI.search(query, types, options);

    return res.status(200).json(results);
  } catch (error) {
    console.error("Spotify search error:", error);
    return res.status(500).json({
      error: "Failed to search Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/tracks/:trackId - Get Spotify track
const getTrack = async (req, res) => {
  try {
    const { trackId } = req.params;
    const { market } = req.query;

    const track = await SpotifyAPI.getTrack(trackId, market);

    return res.status(200).json(track);
  } catch (error) {
    console.error("Get Spotify track error:", error);
    return res.status(500).json({
      error: "Failed to get track from Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/tracks - Get multiple Spotify tracks
const getTracks = async (req, res) => {
  try {
    const { ids, market } = req.query;

    if (!ids) {
      return res.status(400).json({ error: "Track IDs are required" });
    }

    const tracks = await SpotifyAPI.getTracks(ids, market);

    return res.status(200).json({ tracks });
  } catch (error) {
    console.error("Get Spotify tracks error:", error);
    return res.status(500).json({
      error: "Failed to get tracks from Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/albums/:albumId - Get Spotify album
const getAlbum = async (req, res) => {
  try {
    const { albumId } = req.params;
    const { market } = req.query;

    const album = await SpotifyAPI.getAlbum(albumId, market);

    return res.status(200).json(album);
  } catch (error) {
    console.error("Get Spotify album error:", error);
    return res.status(500).json({
      error: "Failed to get album from Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/albums - Get multiple Spotify albums
const getAlbums = async (req, res) => {
  try {
    const { ids, market } = req.query;

    if (!ids) {
      return res.status(400).json({ error: "Album IDs are required" });
    }

    const albums = await SpotifyAPI.getAlbums(ids, market);

    return res.status(200).json({ albums });
  } catch (error) {
    console.error("Get Spotify albums error:", error);
    return res.status(500).json({
      error: "Failed to get albums from Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/artists/:artistId - Get Spotify artist
const getArtist = async (req, res) => {
  try {
    const { artistId } = req.params;

    const artist = await SpotifyAPI.getArtist(artistId);

    return res.status(200).json(artist);
  } catch (error) {
    console.error("Get Spotify artist error:", error);
    return res.status(500).json({
      error: "Failed to get artist from Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/artists - Get multiple Spotify artists
const getArtists = async (req, res) => {
  try {
    const { ids } = req.query;

    if (!ids) {
      return res.status(400).json({ error: "Artist IDs are required" });
    }

    const artists = await SpotifyAPI.getArtists(ids);

    return res.status(200).json({ artists });
  } catch (error) {
    console.error("Get Spotify artists error:", error);
    return res.status(500).json({
      error: "Failed to get artists from Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/playlists/:playlistId - Get Spotify playlist
const getPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { market, fields, additional_types } = req.query;

    const options = {};
    if (market) options.market = market;
    if (fields) options.fields = fields;
    if (additional_types) options.additional_types = additional_types;

    const playlist = await SpotifyAPI.getPlaylist(playlistId, options);

    return res.status(200).json(playlist);
  } catch (error) {
    console.error("Get Spotify playlist error:", error);
    return res.status(500).json({
      error: "Failed to get playlist from Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/search/tracks - Search tracks specifically
const searchTracks = async (req, res) => {
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
    console.error("Spotify track search error:", error);
    return res.status(500).json({
      error: "Failed to search tracks on Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/search/albums - Search albums specifically
const searchAlbums = async (req, res) => {
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
    return res.status(500).json({
      error: "Failed to search albums on Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/search/artists - Search artists specifically
const searchArtists = async (req, res) => {
  try {
    const { query, limit = 20, offset = 0, market } = req.query;

    if (!query) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const results = await SpotifyAPI.searchArtists(query, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      market,
    });

    return res.status(200).json(results);
  } catch (error) {
    console.error("Spotify artist search error:", error);
    return res.status(500).json({
      error: "Failed to search artists on Spotify",
      details: error.message,
    });
  }
};

// GET /spotify/search/playlists - Search playlists specifically
const searchPlaylists = async (req, res) => {
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
    return res.status(500).json({
      error: "Failed to search playlists on Spotify",
      details: error.message,
    });
  }
};

module.exports = {
  searchSpotify,
  getTrack,
  getTracks,
  getAlbum,
  getAlbums,
  getArtist,
  getArtists,
  getPlaylist,
  searchTracks,
  searchAlbums,
  searchArtists,
  searchPlaylists,
};
