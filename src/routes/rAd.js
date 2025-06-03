const express = require("express");
const router = express.Router();

const {
  uploadMiddleware,
  getAllAds,
  getAdById,
  createAd,
  updateAd,
  deleteAd,
  watchAd,
  clickAd,
  getAdAnalytics,
} = require("../controller/cAd");

const { auth, admin } = require("../Middleware/auth");

// // Public routes
// router.get("/", getAllAds);
// router.get("/:id", getAdById);

// User interaction routes (requires authentication)
router.get("/watch", auth, watchAd);
// router.post("/:id/click", clickAd);

// Authenticated routes (advertisers/admin)
router.post("/", auth, uploadMiddleware, createAd);
// router.put("/:id", auth, uploadMiddleware, updateAd);
// router.delete("/:id", auth, deleteAd);
// router.get("/:id/analytics", auth, getAdAnalytics);

module.exports = router;
