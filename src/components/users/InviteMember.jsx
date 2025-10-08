import React, { useState, useEffect } from "react";
import { useToast } from "../../hooks/useToast";
import { invitesAPI } from "../../services/api";
import { successMessages } from "../../utils/errorHandler";
import "./InviteMember.css";

const InviteMember = ({ onClose }) => {
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [pendingInvites, setPendingInvites] = useState([]);

  useEffect(() => {
    fetchPendingInvites();
  }, []);

  const fetchPendingInvites = async () => {
    try {
      const invites = await invitesAPI.list();
      setPendingInvites(invites);
    } catch (err) {
      console.error("Error fetching invites:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setInviteLink("");

    try {
      const response = await invitesAPI.create(email, role);

      // Show success message with email status
      if (response.emailSent) {
        setSuccess(
          `Invitation created successfully! An email has been sent to ${email} with the signup link.`
        );
        toast.showSuccess(`Invitation sent to ${email}`);
      } else {
        setSuccess(
          `Invitation created successfully! ${
            response.emailInfo || "Please share the link manually."
          }`
        );
        toast.showWarning(
          "Invitation created, but email could not be sent. Share the link manually."
        );
      }

      setInviteLink(response.inviteLink);
      setEmail("");
      setRole("member");

      // Refresh pending invites
      fetchPendingInvites();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (code) => {
    if (!window.confirm("Are you sure you want to revoke this invitation?")) {
      return;
    }

    try {
      await invitesAPI.revoke(code);
      setSuccess("Invitation revoked successfully");
      fetchPendingInvites();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to revoke invitation");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.showSuccess(successMessages.inviteCopied);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="invite-member-modal-overlay"
      onClick={(e) => {
        if (e.target.className === "invite-member-modal-overlay") {
          onClose?.();
        }
      }}
    >
      <div className="invite-member-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invite-modal-header">
          <h2>Invite Team Member</h2>
          <button className="modal-close-btn" onClick={onClose} title="Close">
            ×
          </button>
        </div>
        <div className="invite-modal-body">
          <div className="invite-member-container">
            <div className="invite-member-card">
              <p className="subtitle">
                Send an invitation to a new team member to join your
                organization
              </p>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <form onSubmit={handleSubmit} className="invite-form">
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="role">Role</label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Invitation"}
                </button>
              </form>

              {inviteLink && (
                <div className="invite-link-box">
                  <h3>Invitation Link</h3>
                  <p className="help-text">
                    Share this link with the invited person. It expires in 7
                    days.
                  </p>
                  <div className="link-container">
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="link-input"
                    />
                    <button
                      onClick={() => copyToClipboard(inviteLink)}
                      className="btn btn-secondary"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="pending-invites-card">
              <h3>Pending Invitations</h3>
              {pendingInvites.length === 0 ? (
                <p className="no-invites">No pending invitations</p>
              ) : (
                <div className="invites-list">
                  {pendingInvites.map((invite) => (
                    <div key={invite.code} className="invite-item">
                      <div className="invite-info">
                        <span className="invite-email">{invite.email}</span>
                        <span className="invite-role badge">{invite.role}</span>
                        <span className="invite-expires">
                          Expires: {formatDate(invite.expiresAt)}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRevoke(invite.code)}
                        className="btn btn-danger btn-sm"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMember;
