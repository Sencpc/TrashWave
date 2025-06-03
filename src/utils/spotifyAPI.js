const axios = require("axios");

class SpotifyAPI {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }
  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // Check if credentials are available
    if (!this.clientId || !this.clientSecret) {
      throw new Error(
        "Spotify credentials not configured. Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables."
      );
    }

    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        `grant_type=client_credentials&client_id=${this.clientId}&client_secret=${this.clientSecret}`,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      console.error("Spotify API token request failed:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        hasCredentials: !!(this.clientId && this.clientSecret),
      });
      throw new Error(
        `Failed to get Spotify access token: ${
          error.response?.data?.error_description || error.message
        }`
      );
    }
  }
  async getTrack(trackId, market = null) {
    const token = await this.getAccessToken();

    // Validate input
    if (!trackId || typeof trackId !== "string") {
      throw new Error("Track ID must be provided as a string");
    }

    const params = {};
    if (market) {
      params.market = market;
    }

    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(
          `Spotify API error: ${
            error.response.data.error?.message || error.response.statusText
          }`
        );
      }
      throw new Error("Failed to get track from Spotify");
    }
  }

  async getTracks(trackIds, market = null) {
    const token = await this.getAccessToken();

    // Validate input
    if (
      !trackIds ||
      (!Array.isArray(trackIds) && typeof trackIds !== "string")
    ) {
      throw new Error(
        "Track IDs must be provided as an array or comma-separated string"
      );
    }

    // Convert array to comma-separated string if needed
    const idsString = Array.isArray(trackIds) ? trackIds.join(",") : trackIds;

    // Validate maximum 50 IDs
    const idsArray = idsString.split(",");
    if (idsArray.length > 50) {
      throw new Error("Maximum 50 track IDs allowed");
    }

    const params = {
      ids: idsString,
    };

    if (market) {
      params.market = market;
    }

    try {
      const response = await axios.get(`https://api.spotify.com/v1/tracks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });

      return response.data.tracks;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(
          `Spotify API error: ${
            error.response.data.error?.message || error.response.statusText
          }`
        );
      }
      throw new Error("Failed to get tracks from Spotify");
    }
  }

  async getAlbum(albumId, market = null) {
    const token = await this.getAccessToken();

    // Validate input
    if (!albumId || typeof albumId !== "string") {
      throw new Error("Album ID must be provided as a string");
    }

    const params = {};
    if (market) {
      params.market = market;
    }

    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        }
      );

      return response.data;
    } catch (error) {
      throw new Error("Failed to get album from Spotify");
    }
  }

  async getAlbums(albumIds, market = null) {
    const token = await this.getAccessToken();

    // Validate input
    if (
      !albumIds ||
      (!Array.isArray(albumIds) && typeof albumIds !== "string")
    ) {
      throw new Error(
        "Album IDs must be provided as an array or comma-separated string"
      );
    }

    // Convert array to comma-separated string if needed
    const idsString = Array.isArray(albumIds) ? albumIds.join(",") : albumIds;

    // Validate maximum 20 IDs
    const idsArray = idsString.split(",");
    if (idsArray.length > 20) {
      throw new Error("Maximum 20 album IDs allowed");
    }

    const params = {
      ids: idsString,
    };

    if (market) {
      params.market = market;
    }

    try {
      const response = await axios.get(`https://api.spotify.com/v1/albums`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });

      return response.data.albums;
    } catch (error) {
      throw new Error("Failed to get albums from Spotify");
    }
  }

  async getArtists(artistIds) {
    const token = await this.getAccessToken();

    // Validate input
    if (
      !artistIds ||
      (!Array.isArray(artistIds) && typeof artistIds !== "string")
    ) {
      throw new Error(
        "Artist IDs must be provided as an array or comma-separated string"
      );
    }

    // Convert array to comma-separated string if needed
    const idsString = Array.isArray(artistIds)
      ? artistIds.join(",")
      : artistIds;

    // Validate maximum 50 IDs
    const idsArray = idsString.split(",");
    if (idsArray.length > 50) {
      throw new Error("Maximum 50 artist IDs allowed");
    }

    try {
      const response = await axios.get(`https://api.spotify.com/v1/artists`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ids: idsString,
        },
      });

      return response.data.artists;
    } catch (error) {
      throw new Error("Failed to get artists from Spotify");
    }
  }
  async getArtist(artistId) {
    const token = await this.getAccessToken();

    // Validate input
    if (!artistId || typeof artistId !== "string") {
      throw new Error("Artist ID must be provided as a string");
    }

    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error("Failed to get artist from Spotify");
    }
  }

  async search(query, types, options = {}) {
    const token = await this.getAccessToken();

    // Validate required parameters
    if (!query || typeof query !== "string") {
      throw new Error("Query must be provided as a string");
    }

    if (!types) {
      throw new Error("Types must be provided");
    }

    // Validate and process types parameter
    const allowedTypes = [
      "album",
      "artist",
      "playlist",
      "track",
      "show",
      "episode",
      "audiobook",
    ];
    let typesArray;

    if (typeof types === "string") {
      typesArray = types.split(",").map((type) => type.trim());
    } else if (Array.isArray(types)) {
      typesArray = types;
    } else {
      throw new Error("Types must be a string or array");
    }

    // Validate each type
    for (const type of typesArray) {
      if (!allowedTypes.includes(type)) {
        throw new Error(
          `Invalid type: ${type}. Allowed types: ${allowedTypes.join(", ")}`
        );
      }
    }

    const typesString = typesArray.join(",");

    // Build query parameters
    const params = {
      q: query,
      type: typesString,
    };

    // Add optional parameters
    if (options.market) {
      params.market = options.market;
    }

    if (options.limit !== undefined) {
      if (
        typeof options.limit !== "number" ||
        options.limit < 0 ||
        options.limit > 50
      ) {
        throw new Error("Limit must be a number between 0 and 50");
      }
      params.limit = options.limit;
    }

    if (options.offset !== undefined) {
      if (
        typeof options.offset !== "number" ||
        options.offset < 0 ||
        options.offset > 1000
      ) {
        throw new Error("Offset must be a number between 0 and 1000");
      }
      params.offset = options.offset;
    }

    if (options.include_external) {
      if (options.include_external !== "audio") {
        throw new Error("include_external must be 'audio'");
      }
      params.include_external = options.include_external;
    }

    try {
      const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: params,
      });

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(
          `Spotify API error: ${
            error.response.data.error?.message || error.response.statusText
          }`
        );
      }
      throw new Error("Failed to search Spotify");
    }
  }

  // Convenience methods for specific search types
  async searchTracks(query, options = {}) {
    return this.search(query, "track", options);
  }

  async searchArtists(query, options = {}) {
    return this.search(query, "artist", options);
  }

  async searchAlbums(query, options = {}) {
    return this.search(query, "album", options);
  }

  async searchPlaylists(query, options = {}) {
    return this.search(query, "playlist", options);
  }

  async searchShows(query, options = {}) {
    return this.search(query, "show", options);
  }

  async searchEpisodes(query, options = {}) {
    return this.search(query, "episode", options);
  }

  async searchAudiobooks(query, options = {}) {
    return this.search(query, "audiobook", options);
  }

  // Advanced search with multiple types
  async searchMultiple(query, types, options = {}) {
    return this.search(query, types, options);
  }

  async getPlaylist(playlistId, options = {}) {
    const token = await this.getAccessToken();

    // Validate input
    if (!playlistId || typeof playlistId !== "string") {
      throw new Error("Playlist ID must be provided as a string");
    }

    const params = {};

    if (options.market) {
      params.market = options.market;
    }

    if (options.fields) {
      if (typeof options.fields !== "string") {
        throw new Error("Fields must be a string");
      }
      params.fields = options.fields;
    }

    if (options.additional_types) {
      if (typeof options.additional_types === "string") {
        // Validate additional_types values
        const allowedTypes = ["track", "episode"];
        const types = options.additional_types
          .split(",")
          .map((type) => type.trim());

        for (const type of types) {
          if (!allowedTypes.includes(type)) {
            throw new Error(
              `Invalid additional_types: ${type}. Allowed types: ${allowedTypes.join(
                ", "
              )}`
            );
          }
        }

        params.additional_types = options.additional_types;
      } else if (Array.isArray(options.additional_types)) {
        const allowedTypes = ["track", "episode"];

        for (const type of options.additional_types) {
          if (!allowedTypes.includes(type)) {
            throw new Error(
              `Invalid additional_types: ${type}. Allowed types: ${allowedTypes.join(
                ", "
              )}`
            );
          }
        }

        params.additional_types = options.additional_types.join(",");
      } else {
        throw new Error("additional_types must be a string or array");
      }
    }

    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        }
      );

      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw new Error(
          `Spotify API error: ${
            error.response.data.error?.message || error.response.statusText
          }`
        );
      }
      throw new Error("Failed to get playlist from Spotify");
    }
  }
}

module.exports = new SpotifyAPI();
