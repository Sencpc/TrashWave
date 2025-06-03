const axios = require("axios");

class SpotifyAPI {
  constructor() {
    this.clientId = process.env.Client_ID;
    this.clientSecret = process.env.Client_Secret;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${this.clientId}:${this.clientSecret}`
            ).toString("base64")}`,
          },
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      return this.accessToken;
    } catch (error) {
      throw new Error("Failed to get Spotify access token");
    }
  }

  async searchTracks(query, limit = 20, offset = 0) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: query,
          type: "track",
          limit: limit,
          offset: offset,
        },
      });

      return response.data.tracks;
    } catch (error) {
      throw new Error("Failed to search tracks from Spotify");
    }
  }

  async getTrack(trackId) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/tracks/${trackId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error("Failed to get track from Spotify");
    }
  }

  async searchArtists(query, limit = 20, offset = 0) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: query,
          type: "artist",
          limit: limit,
          offset: offset,
        },
      });

      return response.data.artists;
    } catch (error) {
      throw new Error("Failed to search artists from Spotify");
    }
  }

  async getAlbum(albumId) {
    const token = await this.getAccessToken();

    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/albums/${albumId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error("Failed to get album from Spotify");
    }
  }
}

module.exports = new SpotifyAPI();
