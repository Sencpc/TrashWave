const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./src/config/env");
const { apiLimiter } = require("./src/Middleware/rateLimiter");
const { requestLogger } = require("./src/utils/logger");

const app = express();

// Trust proxy setting - required when running behind a proxy (nginx, load balancer, etc.)
// This enables proper handling of X-Forwarded-For headers for rate limiting
app.set("trust proxy", true);

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
const rAdmin = require("./src/routes/rAdmin");
const rAd = require("./src/routes/rAd");
const rSpotify = require("./src/routes/rSpotify");
const { getAPIDocumentation } = require("./src/controller/cDocs");
const { sequelize } = require("./src/config/db");

// Register API endpoints
app.use("/api/v1/account", rAccount);
app.use("/api/v1/songs", rSong);
app.use("/api/v1/artists", rArtist);
app.use("/api/v1/albums", rAlbum);
app.use("/api/v1/playlists", rPlaylist);
app.use("/api/v1/admin", rAdmin);
app.use("/api/v1/ads", rAd);
app.use("/api/v1/spotify", rSpotify);

// API Documentation
app.get("/api/v1/docs", getAPIDocumentation);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "TrashWave API is running",
    documentation: `${req.protocol}://${req.get("host")}/api/v1/docs`,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: config.app.version,
    uptime: process.uptime(),
  });
});

// Railway health check (alternative endpoint)
app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "TrashWave API is running",
    docs: `${req.protocol}://${req.get("host")}/api/v1/docs`,
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

const port = config.app.port || process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    try {
      await sequelize.authenticate();
      console.log("✅ Database connection has been established successfully.");
    } catch (dbError) {
      console.error("❌ Unable to connect to the database:", dbError.message);
      if (process.env.NODE_ENV === "production") {
        console.error("🔄 Continuing without database for health checks...");
      }
    }

    const server = app.listen(port, () => {
      console.log(`🚀 ${config.app.name} API Server running on port ${port}`);
      console.log(`📖 API Documentation: http://localhost:${port}/api/v1/docs`);
      console.log(`💚 Health Check: http://localhost:${port}/health`);
      if (config.app.isDevelopment) {
        console.log(`🔧 Development mode - Enhanced logging enabled`);
      }
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(`❌ Port ${port} is already in use`);
      } else {
        console.error("❌ Server error:", error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("🛑 SIGTERM received, shutting down gracefully");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
