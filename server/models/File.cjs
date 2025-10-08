const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    data: {
      type: String, // Base64 encoded file data
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    fileType: {
      type: String,
      enum: ["avatar", "attachment", "document"],
      default: "attachment",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
fileSchema.index({ organization: 1, uploadedBy: 1 });
fileSchema.index({ filename: 1 });

module.exports = mongoose.model("File", fileSchema);
