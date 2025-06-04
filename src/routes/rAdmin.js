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
const {
  validateBody,
  validateQuery,
  validateParams,
} = require("../Middleware/validation");
const {
  createSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  searchSchema,
  paginationSchema,
} = require("../validation/schemas");

// All admin routes require admin authentication
router.use(auth, admin);

// Dashboard and statistics
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", validateQuery(paginationSchema), getUsers);
router.post("/users/:id/ban", toggleUserBan);

// Artist management
router.get("/artists", validateQuery(paginationSchema), getArtists);

// Content management
router.get("/content", getContentOverview);

// Financial management
router.get("/transactions", validateQuery(paginationSchema), getTransactions);

// API monitoring
router.get("/api-logs", validateQuery(paginationSchema), getApiLogs);

// Subscription plan management
router.post(
  "/subscription-plans",
  validateBody(createSubscriptionPlanSchema),
  createSubscriptionPlan
);
router.put(
  "/subscription-plans/:id",
  validateBody(updateSubscriptionPlanSchema),
  updateSubscriptionPlan
);
router.delete("/subscription-plans/:id", deleteSubscriptionPlan);

// Spotify integration management
router.get("/spotify/search", validateQuery(searchSchema), adminSpotifySearch);
router.get("/spotify/analytics", getSpotifyAnalytics);

module.exports = router;
