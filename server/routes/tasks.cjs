const express = require("express");
const router = express.Router();
const Task = require("../models/Task.cjs");
const { protect, authorize } = require("../middleware/auth.cjs");

// @route   GET /api/tasks
// @desc    Get all tasks for user's organization
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { status, priority, assignee, search } = req.query;

    // Build query
    let query = { organization: req.user.organization._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignee) query.assignee = assignee;

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { project: { $regex: search, $options: "i" } },
      ];
    }

    const tasks = await Task.find(query)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("collaborators", "name email")
      .populate("comments.user", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("collaborators", "name email")
      .populate("comments.user", "name email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if task belongs to user's organization
    if (task.organization.toString() !== req.user.organization._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this task" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create new task
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      organization: req.user.organization._id,
      createdBy: req.user._id,
    };

    const task = await Task.create(taskData);
    const populatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("collaborators", "name email")
      .populate("comments.user", "name email");

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if task belongs to user's organization
    if (task.organization.toString() !== req.user.organization._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this task" });
    }

    // Update task
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("collaborators", "name email")
      .populate("comments.user", "name email");

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task
// @access  Private (Admin/Manager)
router.delete(
  "/:id",
  protect,
  authorize("admin", "manager"),
  async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Check if task belongs to user's organization
      if (
        task.organization.toString() !== req.user.organization._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this task" });
      }

      await task.deleteOne();

      res.json({ message: "Task removed" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// @route   POST /api/tasks/:id/comments
// @desc    Add comment to task
// @access  Private
router.post("/:id/comments", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if task belongs to user's organization
    if (task.organization.toString() !== req.user.organization._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to comment on this task" });
    }

    task.comments.push({
      user: req.user._id,
      text: req.body.text,
    });

    await task.save();

    const updatedTask = await Task.findById(task._id).populate(
      "comments.user",
      "name email"
    );

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/tasks/:id/collaborators
// @desc    Add collaborator to task
// @access  Private
router.post("/:id/collaborators", protect, async (req, res) => {
  try {
    const { userId } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is assignee or creator
    const isAuthorized =
      task.assignee?.toString() === req.user._id.toString() ||
      task.createdBy.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Only assignee or creator can add collaborators" });
    }

    // Check if collaborator already exists
    if (task.collaborators.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is already a collaborator" });
    }

    task.collaborators.push(userId);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("collaborators", "name email")
      .populate("comments.user", "name email");

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/tasks/:id/collaborators/:userId
// @desc    Remove collaborator from task
// @access  Private
router.delete("/:id/collaborators/:userId", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is assignee or creator
    const isAuthorized =
      task.assignee?.toString() === req.user._id.toString() ||
      task.createdBy.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res
        .status(403)
        .json({ message: "Only assignee or creator can remove collaborators" });
    }

    task.collaborators = task.collaborators.filter(
      (collab) => collab.toString() !== req.params.userId
    );

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate("assignee", "name email")
      .populate("createdBy", "name email")
      .populate("collaborators", "name email")
      .populate("comments.user", "name email");

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
