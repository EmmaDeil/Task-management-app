const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User.cjs");
const Organization = require("../models/Organization.cjs");
const { protect } = require("../middleware/auth.cjs");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "15m",
  });
};

// Generate Refresh Token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

// Set refresh token cookie
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // CSRF protection
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, organizationId } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if organization exists
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      organization: organizationId,
      role: "member",
    });

    // Return user data and token
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: organization._id,
          name: organization.name,
          domain: organization.domain,
          plan: organization.plan,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email })
      .select("+password")
      .populate("organization");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account has been deactivated" });
    }

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Return user data and access token
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: user.organization._id,
          name: user.organization.name,
          domain: user.organization.domain,
          plan: user.organization.plan,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("organization");

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      organization: {
        id: user.organization._id,
        name: user.organization.name,
        domain: user.organization.domain,
        plan: user.organization.plan,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/auth/organization/register
// @desc    Register a new organization with admin user
// @access  Public
router.post("/organization/register", async (req, res) => {
  try {
    const { organizationName, domain, name, email, password, plan } = req.body;

    // Validate required fields
    if (!organizationName || !domain || !name || !email || !password) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check if organization domain already exists
    const orgExists = await Organization.findOne({ domain });
    if (orgExists) {
      return res.status(400).json({
        message:
          "Organization domain already taken. Please choose a different organization name.",
      });
    }

    // Check if user email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message:
          "An account with this email already exists. Please use a different email or sign in.",
      });
    }

    // Create organization with plan
    const organization = await Organization.create({
      name: organizationName,
      domain,
      plan: plan || "free",
    });

    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      organization: organization._id,
      role: "admin",
    });

    // Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token in httpOnly cookie
    setRefreshTokenCookie(res, refreshToken);

    // Return user data and access token
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: organization._id,
          name: organization.name,
          domain: organization.domain,
          plan: organization.plan,
        },
      },
    });
  } catch (error) {
    console.error("Organization registration error:", error);
    res.status(500).json({
      message:
        "Server error during organization registration. Please try again.",
      error: error.message,
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token using refresh token
// @access  Public
router.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user and verify refresh token matches
    const user = await User.findById(decoded.id)
      .select("+refreshToken")
      .populate("organization");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Check if user is still active
    if (!user.isActive) {
      return res.status(401).json({ message: "Account has been deactivated" });
    }

    // Generate new access token
    const newAccessToken = generateToken(user._id);

    res.json({
      token: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: user.organization._id,
          name: user.organization.name,
          domain: user.organization.domain,
          plan: user.organization.plan,
        },
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Refresh token expired. Please log in again." });
    }
    res.status(401).json({ message: "Invalid refresh token" });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user and clear refresh token
// @access  Private
router.post("/logout", protect, async (req, res) => {
  try {
    // Clear refresh token from database
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

    // Clear refresh token cookie
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
