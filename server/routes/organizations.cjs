const express = require("express");
const router = express.Router();
const Organization = require("../models/Organization.cjs");
const User = require("../models/User.cjs");
const { protect, authorize } = require("../middleware/auth.cjs");

// @route   GET /api/organizations
// @desc    Get all organizations (for registration)
// @access  Public
router.get("/", async (req, res) => {
  try {
    const organizations = await Organization.find({}, "name domain plan").sort({
      name: 1,
    });

    res.json(organizations);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/organizations/:id
// @desc    Get organization details
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    // Check if user belongs to this organization
    if (req.user.organization._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this organization" });
    }

    const organization = await Organization.findById(req.params.id);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/organizations/:id
// @desc    Update organization
// @access  Private (Admin only)
router.put("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    // Check if user belongs to this organization
    if (req.user.organization._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this organization" });
    }

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json(organization);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/organizations/:id/users
// @desc    Get all users in organization
// @access  Private
router.get("/:id/users", protect, async (req, res) => {
  try {
    // Check if user belongs to this organization
    if (req.user.organization._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this organization" });
    }

    const users = await User.find({ organization: req.params.id })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
