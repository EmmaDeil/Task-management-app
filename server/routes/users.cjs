const express = require("express");
const router = express.Router();
const User = require("../models/User.cjs");
const File = require("../models/File.cjs");
const { protect, authorize } = require("../middleware/auth.cjs");

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

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar (now using MongoDB file storage)
// @access  Private
router.post("/upload-avatar", protect, async (req, res) => {
  try {
    // Avatar should be uploaded via /api/files/upload first
    // This route just updates the user's avatar reference
    const { fileId } = req.body;

    if (!fileId) {
      return res.status(400).json({
        message:
          "Please upload file via /api/files/upload first, then provide fileId",
      });
    }

    // Verify file exists and belongs to this user's organization
    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    if (file.organization.toString() !== req.user.organization._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to use this file" });
    }

    // Update user's avatar field with file ID
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: fileId },
      { new: true }
    ).select("-password");

    res.json({
      message: "Avatar updated successfully",
      avatar: fileId,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/users/:id/password
// @desc    Change user password
// @access  Private (own profile only)
router.put("/:id/password", protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validate passwords
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    // Check authorization (only own profile)
    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to change this password" });
    }

    // Get user with password
    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/users/:id/delete-account
// @desc    Permanently delete user account
// @access  Private (own profile only)
router.delete("/:id/delete-account", protect, async (req, res) => {
  try {
    const { password } = req.body;

    // Check authorization (only own profile)
    if (req.user._id.toString() !== req.params.id) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this account" });
    }

    // Get user with password
    const user = await User.findById(req.params.id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify password
    if (password) {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: "Password is incorrect" });
      }
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
