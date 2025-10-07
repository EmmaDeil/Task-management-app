const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_updated",
        "task_completed",
        "deadline_approaching",
        "project_created",
        "project_updated",
        "team_invite",
        "comment_added",
        "mention",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String, // URL to navigate to when clicked
    },
    relatedTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    relatedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
