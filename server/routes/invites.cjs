const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Organization = require("../models/Organization.cjs");
const User = require("../models/User.cjs");
const { protect, authorize } = require("../middleware/auth.cjs");
const {
  sendInvitationEmail,
  sendWelcomeEmail,
} = require("../utils/emailService.cjs");

// Invitation model (simple in-memory or could be MongoDB model)
// For production, create a proper Invitation model
const invitations = new Map(); // inviteCode -> { organizationId, email, role, expiresAt }

// @route   POST /api/invites/create
// @desc    Create invitation link/code
// @access  Private (Admin only)
router.post("/create", protect, authorize("admin"), async (req, res) => {
  try {
    const { email, role = "member" } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate unique invite code
    const inviteCode = crypto.randomBytes(16).toString("hex");

    // Store invitation (expires in 7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    invitations.set(inviteCode, {
      organizationId: req.user.organization._id.toString(),
      email,
      role,
      expiresAt,
      invitedBy: req.user._id.toString(),
    });

    // In production, send email with invite link
    const inviteLink = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/auth?invite=${inviteCode}`;

    // Get organization details for email
    const organization = await Organization.findById(req.user.organization._id);

    // Send invitation email
    const emailResult = await sendInvitationEmail({
      email,
      inviteLink,
      organizationName: organization.name,
      role,
      invitedBy: req.user.name,
    });

    res.json({
      message: "Invitation created successfully",
      inviteCode,
      inviteLink,
      expiresAt,
      emailSent: emailResult.sent,
      emailInfo: emailResult.sent
        ? "Invitation email sent successfully"
        : emailResult.reason || "Email could not be sent",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/invites/validate/:code
// @desc    Validate invitation code
// @access  Public
router.get("/validate/:code", async (req, res) => {
  try {
    const { code } = req.params;

    const invitation = invitations.get(code);

    if (!invitation) {
      return res.status(404).json({ message: "Invalid invitation code" });
    }

    // Check if expired
    if (new Date() > new Date(invitation.expiresAt)) {
      invitations.delete(code);
      return res.status(400).json({ message: "Invitation has expired" });
    }

    // Get organization details
    const organization = await Organization.findById(invitation.organizationId);

    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    res.json({
      valid: true,
      email: invitation.email,
      role: invitation.role,
      organization: {
        id: organization._id,
        name: organization.name,
        domain: organization.domain,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/invites/accept/:code
// @desc    Accept invitation and create user account
// @access  Public
router.post("/accept/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const { name, password } = req.body;

    if (!name || !password) {
      return res
        .status(400)
        .json({ message: "Name and password are required" });
    }

    const invitation = invitations.get(code);

    if (!invitation) {
      return res.status(404).json({ message: "Invalid invitation code" });
    }

    // Check if expired
    if (new Date() > new Date(invitation.expiresAt)) {
      invitations.delete(code);
      return res.status(400).json({ message: "Invitation has expired" });
    }

    // Create user
    const user = await User.create({
      name,
      email: invitation.email,
      password,
      organization: invitation.organizationId,
      role: invitation.role,
    });

    // Delete invitation after use
    invitations.delete(code);

    // Generate token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // Get organization details
    const organization = await Organization.findById(invitation.organizationId);

    // Send welcome email
    await sendWelcomeEmail({
      email: user.email,
      name: user.name,
      organizationName: organization.name,
    });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: {
          id: organization._id,
          name: organization.name,
          domain: organization.domain,
          plan: organization.plan,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/invites/list
// @desc    List all pending invitations
// @access  Private (Admin only)
router.get("/list", protect, authorize("admin"), async (req, res) => {
  try {
    const orgId = req.user.organization._id.toString();
    const pendingInvites = [];

    // Filter invitations for this organization
    for (const [code, invitation] of invitations.entries()) {
      if (
        invitation.organizationId === orgId &&
        new Date() < new Date(invitation.expiresAt)
      ) {
        pendingInvites.push({
          code,
          email: invitation.email,
          role: invitation.role,
          expiresAt: invitation.expiresAt,
        });
      }
    }

    res.json(pendingInvites);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/invites/:code
// @desc    Revoke invitation
// @access  Private (Admin only)
router.delete("/:code", protect, authorize("admin"), async (req, res) => {
  try {
    const { code } = req.params;
    const invitation = invitations.get(code);

    if (!invitation) {
      return res.status(404).json({ message: "Invitation not found" });
    }

    // Verify invitation belongs to admin's organization
    if (invitation.organizationId !== req.user.organization._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to revoke this invitation" });
    }

    invitations.delete(code);
    res.json({ message: "Invitation revoked successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
