const jwt = require("jsonwebtoken");
const User = require("../models/User.cjs");

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized to access this route" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).populate("organization");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (_error) {
    return res
      .status(401)
      .json({ message: "Not authorized to access this route" });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user belongs to organization
exports.checkOrganization = (req, res, next) => {
  if (
    req.params.organizationId &&
    req.user.organization._id.toString() !== req.params.organizationId
  ) {
    return res.status(403).json({
      message: "Not authorized to access this organization",
    });
  }
  next();
};
