const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./src/config/env");
const { syncDatabase } = require("./src/db/sync");
const { apiLimiter } = require("./src/middleware/rateLimiter");
const { requestLogger } = require("./src/utils/logger");

const app = express();

// Middleware
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Request logging
if (config.app.isDevelopment) {
  app.use(requestLogger);
}

// Rate limiting
app.use("/api/", apiLimiter);

// Serve static files
app.use("/storage", express.static(path.join(__dirname, "storage")));

// Import route modules
const rAccount = require("./src/routes/rAccount");
const rSong = require("./src/routes/rSong");
const rArtist = require("./src/routes/rArtist");
const rAlbum = require("./src/routes/rAlbum");
const rPlaylist = require("./src/routes/rPlaylist");
const rUser = require("./src/routes/rUser");
const rAdmin = require("./src/routes/rAdmin");
const rSubscription = require("./src/routes/rSubscription");
const rAd = require("./src/routes/rAd");
const rSpotify = require("./src/routes/rSpotify");
const { getAPIDocumentation } = require("./src/controller/cDocs");

// Register API endpoints
app.use("/api/v1/account", rAccount);
app.use("/api/v1/songs", rSong);
app.use("/api/v1/artists", rArtist);
app.use("/api/v1/albums", rAlbum);
app.use("/api/v1/playlists", rPlaylist);
app.use("/api/v1/users", rUser);
app.use("/api/v1/admin", rAdmin);
app.use("/api/v1/subscriptions", rSubscription);
app.use("/api/v1/ads", rAd);
app.use("/api/v1/spotify", rSpotify);

// API Documentation
app.get("/api/v1/docs", getAPIDocumentation);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "TrashWave API is running",
    documentation: `${req.protocol}://${req.get("host")}/api/v1/docs`,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use("/*path", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

const port = config.app.port;

// Initialize database and start server
const startServer = async () => {
  try {
    // Sync database
    // await syncDatabase();

    // Start server
    app.listen(port, () => {
      console.log(`🚀 ${config.app.name} API Server running on port ${port}`);
      console.log(`📖 API Documentation: http://localhost:${port}/api/v1/docs`);
      console.log(`💚 Health Check: http://localhost:${port}/health`);
      if (config.app.isDevelopment) {
        console.log(`🔧 Development mode - Enhanced logging enabled`);
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
