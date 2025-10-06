const mongoose = require("mongoose");

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add an organization name"],
      trim: true,
      unique: true,
    },
    domain: {
      type: String,
      required: [true, "Please add a domain"],
      unique: true,
      lowercase: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    settings: {
      allowInvites: {
        type: Boolean,
        default: true,
      },
      defaultTaskStatus: {
        type: String,
        default: "todo",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Organization", organizationSchema);
