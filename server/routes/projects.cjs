const express = require("express");
const router = express.Router();
const Project = require("../models/Project.cjs");
const { protect, authorize } = require("../middleware/auth.cjs");

// @route   GET /api/projects
// @desc    Get all projects for the user's organization
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { search } = req.query;

    // Build query
    const query = {
      organization: req.user.organization._id,
    };

    // Add search if provided
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { status: { $regex: search, $options: "i" } },
      ];
    }

    const projects = await Project.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/projects/:id
// @desc    Get single project
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if project belongs to user's organization
    if (
      project.organization.toString() !== req.user.organization._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this project" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create new project
// @access  Private (Admin/Manager)
router.post("/", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    const projectData = {
      ...req.body,
      organization: req.user.organization._id,
      createdBy: req.user._id,
    };

    const project = await Project.create(projectData);
    const populatedProject = await Project.findById(project._id).populate(
      "createdBy",
      "name email"
    );

    res.status(201).json(populatedProject);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private (Admin/Manager)
router.put("/:id", protect, authorize("admin", "manager"), async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Check if project belongs to user's organization
    if (
      project.organization.toString() !== req.user.organization._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this project" });
    }

    // Update project
    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete project
// @access  Private (Admin/Manager)
router.delete(
  "/:id",
  protect,
  authorize("admin", "manager"),
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if project belongs to user's organization
      if (
        project.organization.toString() !== req.user.organization._id.toString()
      ) {
        return res
          .status(403)
          .json({ message: "Not authorized to delete this project" });
      }

      await Project.findByIdAndDelete(req.params.id);

      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

module.exports = router;
