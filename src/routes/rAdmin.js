const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getUsers,
  getArtists,
  getContentOverview,
  getTransactions,
  getApiLogs,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  toggleUserBan,
  adminSpotifySearch,
  getSpotifyAnalytics,
} = require("../controller/cAdmin");

const { auth, admin } = require("../Middleware/auth");

// All admin routes require admin authentication
router.use(auth, admin);

// Dashboard and statistics
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getUsers);
router.post("/users/:id/ban", toggleUserBan);

// Artist management
router.get("/artists", getArtists);

// Content management
router.get("/content", getContentOverview);

// Financial management
router.get("/transactions", getTransactions);

// API monitoring
router.get("/api-logs", getApiLogs);

// Subscription plan management
router.post("/subscription-plans", createSubscriptionPlan);
router.put("/subscription-plans/:id", updateSubscriptionPlan);
router.delete("/subscription-plans/:id", deleteSubscriptionPlan);

// Spotify integration management
router.get("/spotify/search", adminSpotifySearch);
router.get("/spotify/analytics", getSpotifyAnalytics);

module.exports = router;
