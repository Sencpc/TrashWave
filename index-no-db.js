const express = require("express");
const cors = require("cors");
const path = require("path");
const config = require("./src/config/env");
const { apiLimiter } = require("./src/Middleware/rateLimiter");
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

// Register API endpoints
app.use("/api/v1/account", rAccount);

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

// Start server without database sync
app.listen(port, () => {
  console.log(`🚀 ${config.app.name} API Server running on port ${port}`);
  console.log(`💚 Health Check: http://localhost:${port}/health`);
  if (config.app.isDevelopment) {
    console.log(`🔧 Development mode - Enhanced logging enabled`);
  }
});
