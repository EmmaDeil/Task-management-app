const express = require("express");
const router = express.Router();
const multer = require("multer");
const File = require("../models/File.cjs");
const { protect } = require("../middleware/auth.cjs");

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// @route   POST /api/files/upload
// @desc    Upload file to MongoDB
// @access  Private
router.post("/upload", protect, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { fileType = "attachment" } = req.body;

    // Convert file buffer to base64
    const base64Data = req.file.buffer.toString("base64");

    // Create file document
    const file = await File.create({
      filename: `${Date.now()}-${req.file.originalname}`,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: base64Data,
      uploadedBy: req.user._id,
      organization: req.user.organization._id,
      fileType: fileType,
    });

    // Return file metadata (without the actual data)
    res.status(201).json({
      id: file._id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      fileType: file.fileType,
      uploadedBy: file.uploadedBy,
      createdAt: file.createdAt,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res
      .status(500)
      .json({ message: "File upload failed", error: error.message });
  }
});

// @route   GET /api/files/:id
// @desc    Get file by ID
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user belongs to same organization
    if (file.organization.toString() !== req.user.organization._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this file" });
    }

    // Convert base64 back to buffer
    const buffer = Buffer.from(file.data, "base64");

    // Set headers
    res.set({
      "Content-Type": file.mimeType,
      "Content-Length": buffer.length,
      "Content-Disposition": `inline; filename="${file.originalName}"`,
    });

    res.send(buffer);
  } catch (error) {
    console.error("File retrieval error:", error);
    res
      .status(500)
      .json({ message: "File retrieval failed", error: error.message });
  }
});

// @route   GET /api/files/metadata/:id
// @desc    Get file metadata without downloading
// @access  Private
router.get("/metadata/:id", protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id, "-data").populate(
      "uploadedBy",
      "name email"
    );

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user belongs to same organization
    if (file.organization.toString() !== req.user.organization._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this file" });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/files/:id
// @desc    Delete file
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user belongs to same organization
    if (file.organization.toString() !== req.user.organization._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this file" });
    }

    // Only the uploader or admin can delete
    if (
      file.uploadedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this file" });
    }

    await file.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/files
// @desc    Get all files for organization
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const { fileType } = req.query;

    const query = {
      organization: req.user.organization._id,
    };

    if (fileType) {
      query.fileType = fileType;
    }

    const files = await File.find(query, "-data")
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
