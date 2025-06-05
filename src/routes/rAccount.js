const express = require("express");
const router = express.Router();

const {
  register,
  login,
  logout,
  updateProfile,
  getUser,
  getUserByUsername,
  subscribeUser,
  getUserQuota,
  createAdmin,
  deleteAccount,
  getSubscriptionPlans,
  subscribeToPlан,
  getCurrentSubscription,
  getTransactionHistory,
} = require("../controller/cAccount");
const { auth } = require("../Middleware/auth");
const { authLimiter, uploadLimiter } = require("../Middleware/rateLimiter");
const {
  validateBody,
  validateParams,
  validateMultipart,
  validateQuery,
} = require("../Middleware/validation");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  subscribeSchema,
  createAdminSchema,
  deleteAccountSchema,
  subscriptionSchema,
  paginationSchema,
} = require("../validation/schemas");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, validateBody(loginSchema), login);
router.get("/logout", logout);
router.put(
  "/profile",
  auth,
  uploadLimiter,
  validateMultipart(updateProfileSchema),
  updateProfile
);
router.post("/subscribe", validateBody(subscribeSchema), subscribeUser);
router.post(
  "/admin",
  authLimiter,
  validateBody(createAdminSchema),
  createAdmin
);

// Tambahan endpoint:
router.get("/user", auth, getUser); // GET user by API key (header: x-api-key)
router.get("/user/:username", getUserByUsername); // GET user by username (public)
router.get("/quota", auth, getUserQuota); // GET /api/v1/account/quota
router.delete("/delete", validateBody(deleteAccountSchema), auth, deleteAccount); // DELETE account

// Subscription endpoints:
router.get("/subscription/plans", getSubscriptionPlans); // GET subscription plans
router.post(
  "/subscription/subscribe",
  validateBody(subscriptionSchema),
  subscribeToPlан
); // Subscribe to plan
router.get("/subscription/current", getCurrentSubscription); // GET current subscription
router.get(
  "/subscription/transactions",
  validateQuery(paginationSchema),
  getTransactionHistory
); // GET transaction history

module.exports = router;
