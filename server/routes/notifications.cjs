const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification.cjs");
const Task = require("../models/Task.cjs");
const { protect } = require("../middleware/auth.cjs");

// @route   GET /api/notifications
// @desc    Get all notifications for the current user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { limit = 20, skip = 0, unreadOnly = false } = req.query;

    const query = {
      user: req.user._id,
      organization: req.user.organization,
    };

    if (unreadOnly === "true") {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate("relatedUser", "name email")
      .populate("relatedTask", "title status")
      .populate("relatedProject", "name");

    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      organization: req.user.organization,
      isRead: false,
    });

    res.json({
      notifications,
      unreadCount,
      total: await Notification.countDocuments(query),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get("/unread-count", protect, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      organization: req.user.organization,
      isRead: false,
    });

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put("/:id/read", protect, async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put("/mark-all-read", protect, async (req, res) => {
  try {
    await Notification.updateMany(
      {
        user: req.user._id,
        organization: req.user.organization,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/notifications/create
// @desc    Create a new notification (for testing or system use)
// @access  Private
router.post("/create", protect, async (req, res) => {
  try {
    const {
      userId,
      type,
      title,
      message,
      link,
      relatedTask,
      relatedProject,
      priority,
    } = req.body;

    const notification = await Notification.create({
      user: userId || req.user._id,
      organization: req.user.organization,
      type,
      title,
      message,
      link,
      relatedTask,
      relatedProject,
      priority: priority || "normal",
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/notifications/:id/action
// @desc    Perform action on notification (mark task complete, dismiss, etc.)
// @access  Private
router.put("/:id/action", protect, async (req, res) => {
  try {
    const { action } = req.body; // "complete" or "dismiss"

    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Mark notification as read
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    // Handle specific actions
    if (action === "complete" && notification.relatedTask) {
      // Mark the related task as complete
      const task = await Task.findById(notification.relatedTask);
      if (task) {
        task.status = "done";
        await task.save();
        return res.json({
          message: "Task marked as complete",
          notification,
          task,
        });
      }
    } else if (action === "dismiss") {
      // Just dismiss the notification (already marked as read above)
      return res.json({
        message: "Notification dismissed",
        notification,
      });
    }

    res.json({ notification });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
