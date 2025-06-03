const jwt = require("jsonwebtoken");
const { User } = require("../Model/mIndex");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "TRASHWAVE");
    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active) {
      return res.status(401).json({
        error: "Invalid token or user is inactive.",
      });
    }

    req.user = user.toJSON(); // Ensure plain object with correct field names
    next();
  } catch (error) {
    res.status(401).json({
      error: "Invalid token.",
    });
  }
};

const admin = (req, res, next) => {
  if (req.user.ROLE !== "admin") {
    return res.status(403).json({
      error: "Access denied. Admin role required.",
    });
  }
  next();
};

const artist = (req, res, next) => {
  if (req.user.ROLE !== "artist") {
    return res.status(403).json({
      error: "Access denied. Artist role required.",
    });
  }
  next();
};

const checkOwnership = (req, res, next) => {
  const userId = req.params.userId || req.params.id;

  if (req.user.role === "admin" || req.user.id == userId) {
    return next();
  }

  return res.status(403).json({
    error: "Access denied. You can only access your own resources.",
  });
};

module.exports = {
  auth,
  admin,
  artist,
  checkOwnership,
};
