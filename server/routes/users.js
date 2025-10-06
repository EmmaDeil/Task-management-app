const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/users
// @desc    Get all users in organization
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({ organization: req.user.organization._id })
      .select("-password")
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("organization");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user belongs to same organization
    if (
      user.organization._id.toString() !== req.user.organization._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this user" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin or own profile)
router.put("/:id", protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check authorization (admin or updating own profile)
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== req.params.id
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this user" });
    }

    // Don't allow regular users to change their role
    if (req.body.role && req.user.role !== "admin") {
      delete req.body.role;
    }

    // Don't allow password update through this route
    delete req.body.password;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete/deactivate user
// @access  Private (Admin only)
router.delete("/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if user belongs to same organization
    if (user.organization.toString() !== req.user.organization._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this user" });
    }

    // Deactivate instead of delete
    user.isActive = false;
    await user.save();

    res.json({ message: "User deactivated" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
