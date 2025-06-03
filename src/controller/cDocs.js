const getAPIDocumentation = (req, res) => {
  const docs = {
    title: "TrashWave Music Streaming API",
    version: "1.0.0",
    description:
      "Comprehensive music streaming platform with user authentication, role-based authorization, and Spotify integration",
    baseURL: `${req.protocol}://${req.get("host")}/api/v1`,
    endpoints: {
      account: {
        "POST /account/register": "Register new user account",
        "POST /account/login": "Login user",
        "POST /account/logout": "Logout user",
        "POST /account/refresh": "Refresh access token",
        "PUT /account/profile": "Update user profile",
        "PUT /account/password": "Change password",
        "DELETE /account": "Delete user account",
      },
      songs: {
        "GET /songs": "Get all songs with pagination and filtering",
        "GET /songs/:id": "Get song by ID",
        "POST /songs": "Create new song (Artist/Admin only)",
        "PUT /songs/:id": "Update song (Artist/Admin only)",
        "DELETE /songs/:id": "Delete song (Artist/Admin only)",
        "POST /songs/:id/like": "Like/unlike a song",
        "POST /songs/:id/play": "Record song play",
        "POST /songs/:id/download": "Download song (Premium users)",
        "GET /songs/search/spotify": "Search songs on Spotify",
      },
      artists: {
        "GET /artists": "Get all artists",
        "GET /artists/:id": "Get artist by ID",
        "POST /artists/register": "Register as artist",
        "PUT /artists/profile": "Update artist profile",
        "POST /artists/:id/follow": "Follow/unfollow artist",
        "GET /artists/:id/songs": "Get artist's songs",
        "GET /artists/:id/albums": "Get artist's albums",
        "GET /artists/:id/followers": "Get artist's followers",
      },
      albums: {
        "GET /albums": "Get all albums",
        "GET /albums/:id": "Get album by ID",
        "POST /albums": "Create new album (Artist/Admin only)",
        "PUT /albums/:id": "Update album (Artist/Admin only)",
        "DELETE /albums/:id": "Delete album (Artist/Admin only)",
        "POST /albums/:id/like": "Like/unlike album",
        "GET /albums/:id/songs": "Get album songs",
        "POST /albums/:id/songs": "Add song to album",
      },
      playlists: {
        "GET /playlists": "Get public playlists",
        "GET /playlists/:id": "Get playlist by ID",
        "POST /playlists": "Create new playlist",
        "PUT /playlists/:id": "Update playlist",
        "DELETE /playlists/:id": "Delete playlist",
        "POST /playlists/:id/like": "Like/unlike playlist",
        "GET /playlists/:id/songs": "Get playlist songs",
        "POST /playlists/:id/songs": "Add song to playlist",
        "DELETE /playlists/:id/songs/:songId": "Remove song from playlist",
      },
      users: {
        "GET /users/profile": "Get current user profile",
        "GET /users/liked-songs": "Get user's liked songs",
        "GET /users/liked-albums": "Get user's liked albums",
        "GET /users/liked-playlists": "Get user's liked playlists",
        "GET /users/downloads": "Get user's download history",
        "GET /users/following": "Get followed artists",
        "GET /users/playlists": "Get user's playlists",
      },
      admin: {
        "GET /admin/dashboard": "Get admin dashboard data",
        "GET /admin/users": "Get all users (Admin only)",
        "PUT /admin/users/:id/status": "Update user status",
        "GET /admin/analytics": "Get platform analytics",
        "GET /admin/reports": "Get content reports",
        "PUT /admin/reports/:id": "Update report status",
      },
      subscriptions: {
        "GET /subscriptions/plans": "Get available subscription plans",
        "POST /subscriptions/subscribe": "Subscribe to plan",
        "PUT /subscriptions/upgrade": "Upgrade subscription",
        "DELETE /subscriptions/cancel": "Cancel subscription",
        "GET /subscriptions/history": "Get payment history",
      },
      ads: {
        "GET /ads": "Get all active ads",
        "GET /ads/:id": "Get ad by ID",
        "POST /ads": "Create new ad (Admin/Advertiser only)",
        "PUT /ads/:id": "Update ad",
        "DELETE /ads/:id": "Delete ad",
        "POST /ads/:id/watch": "Record ad view",
        "POST /ads/:id/click": "Record ad click",
        "GET /ads/:id/analytics": "Get ad analytics",
      },
    },
    authentication: {
      type: "Bearer Token",
      header: "Authorization: Bearer <token>",
      description:
        "Include JWT token in Authorization header for authenticated requests",
    },
    userRoles: {
      user: "Regular user with basic features",
      artist: "Content creator with upload permissions",
      admin: "Full platform access and management",
    },
    subscriptionTiers: {
      Free: {
        price: 0,
        features: "5 downloads/day, 3 playlists, ads enabled, standard quality",
      },
      "Premium Lite": {
        price: 4.99,
        features: "50 downloads/day, 20 playlists, ad-free, high quality",
      },
      Premium: {
        price: 9.99,
        features:
          "Unlimited downloads, unlimited playlists, ad-free, lossless quality",
      },
    },
    fileUploads: {
      songs: {
        endpoint: "POST /songs",
        formats: "mp3, wav, flac, m4a",
        maxSize: "50MB",
      },
      images: {
        formats: "jpeg, jpg, png",
        maxSize: "5MB",
      },
    },
    rateLimits: {
      general: "100 requests per 15 minutes",
      authentication: "5 requests per 15 minutes",
      uploads: "20 requests per hour",
      search: "30 requests per minute",
      ads: "10 interactions per minute",
    },
    errorCodes: {
      400: "Bad Request - Invalid input data",
      401: "Unauthorized - Authentication required",
      403: "Forbidden - Insufficient permissions",
      404: "Not Found - Resource not found",
      429: "Too Many Requests - Rate limit exceeded",
      500: "Internal Server Error - Server error",
    },
    responseFormat: {
      success: {
        success: true,
        message: "Operation successful",
        data: "Response data",
      },
      error: {
        success: false,
        message: "Error message",
        errors: "Validation errors (if applicable)",
      },
    },
  };

  res.json(docs);
};

module.exports = {
  getAPIDocumentation,
};
