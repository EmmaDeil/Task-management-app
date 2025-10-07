import React, { useState, useEffect } from "react";
import { invitesAPI } from "../../services/api";
import "./InviteMember.css";

const InviteMember = () => {
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
      setSuccess("Invitation created successfully!");
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
    alert("Invite link copied to clipboard!");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="invite-member-container">
      <div className="invite-member-card">
        <h2>Invite Team Member</h2>
        <p className="subtitle">
          Send an invitation to a new team member to join your organization
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

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Invitation"}
          </button>
        </form>

        {inviteLink && (
          <div className="invite-link-box">
            <h3>Invitation Link</h3>
            <p className="help-text">
              Share this link with the invited person. It expires in 7 days.
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
  );
};

export default InviteMember;
