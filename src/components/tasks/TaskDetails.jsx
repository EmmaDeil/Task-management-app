import React, { useState, useRef, useEffect } from "react";
import TaskForm from "./TaskForm";
import { tasksAPI, organizationsAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../hooks/useAuth";

const TaskDetails = ({
  task,
  onClose,
  onUpdate,
  onDelete,
  onMove,
  columns,
}) => {
  const toast = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [showAddCollaborator, setShowAddCollaborator] = useState(false);
  const [orgUsers, setOrgUsers] = useState([]);

  // Safely initialize comments, ensuring they have proper structure
  const [comments, setComments] = useState(() => {
    const taskComments = task.comments || [];
    // Validate and sanitize comments
    return Array.isArray(taskComments)
      ? taskComments.filter((c) => c && typeof c === "object")
      : [];
  });

  const [newComment, setNewComment] = useState("");

  // @mention functionality state
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState(0);
  const commentInputRef = useRef(null);

  // Update comments when task prop changes (after parent updates it)
  useEffect(() => {
    const taskComments = task.comments || [];
    const validComments = Array.isArray(taskComments)
      ? taskComments.filter((c) => c && typeof c === "object")
      : [];
    setComments(validComments);
  }, [task, task.comments]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#ff5722";
      case "medium":
        return "#ff9800";
      case "low":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDate) => {
    return dueDate && new Date(dueDate) < new Date();
  };

  const handleUpdate = (updatedData) => {
    const taskId = task._id || task.id;
    console.log("TaskDetails handleUpdate called");
    console.log("Task ID:", taskId);
    console.log("Updated data:", updatedData);
    console.log("Original task:", task);
    onUpdate(taskId, updatedData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    const taskId = task._id || task.id;
    onDelete(taskId);
    onClose();
  };

  // Fetch organization users
  useEffect(() => {
    const fetchOrgUsers = async () => {
      try {
        if (user?.organization?._id) {
          const users = await organizationsAPI.getUsers(user.organization._id);
          setOrgUsers(users);
        }
      } catch (error) {
        console.error("Error fetching organization users:", error);
      }
    };
    fetchOrgUsers();
  }, [user]);

  const handleAddCollaborator = async (userId) => {
    try {
      const taskId = task._id || task.id;
      const updatedTask = await tasksAPI.addCollaborator(taskId, userId);
      onUpdate(updatedTask);
      setShowAddCollaborator(false);
      toast.showSuccess("Collaborator added successfully");
    } catch (error) {
      console.error("Error adding collaborator:", error);
      toast.showError(
        error.response?.data?.message || "Failed to add collaborator"
      );
    }
  };

  const handleRemoveCollaborator = async (userId) => {
    try {
      const taskId = task._id || task.id;
      const updatedTask = await tasksAPI.removeCollaborator(taskId, userId);
      onUpdate(updatedTask);
      toast.showSuccess("Collaborator removed successfully");
    } catch (error) {
      console.error("Error removing collaborator:", error);
      toast.showError(
        error.response?.data?.message || "Failed to remove collaborator"
      );
    }
  };

  const handleStatusChange = (newStatus) => {
    // Handle both _id (MongoDB) and id (local) formats
    const taskId = task._id || task.id;
    onMove(taskId, newStatus);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() === "") return;

    setIsAddingComment(true);

    try {
      // Call backend API to add comment
      const taskId = task._id || task.id;
      const updatedTask = await tasksAPI.addComment(taskId, newComment);

      // Update comments with the response from backend
      // The backend returns the full task with populated comments
      if (updatedTask.comments) {
        setComments(updatedTask.comments);
      }

      // Clear input
      setNewComment("");

      toast.showSuccess("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.showError("Failed to add comment. Please try again.");
    } finally {
      setIsAddingComment(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "Unknown time";

    try {
      const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
      if (isNaN(seconds)) return "Unknown time";

      if (seconds < 60) return "Just now";
      if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
      if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
      return new Date(timestamp).toLocaleDateString();
    } catch (error) {
      console.error("Error parsing timestamp:", error);
      return "Unknown time";
    }
  };

  // Handle comment input changes and detect @ mentions
  const handleCommentChange = (e) => {
    const value = e.target.value;
    const cursorPos = e.target.selectionStart;
    setNewComment(value);

    // Check if @ was typed
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1 && cursorPos - lastAtIndex <= 20) {
      // Extract text after @
      const query = textBeforeCursor.substring(lastAtIndex + 1);

      // Check if there's a space before the query ends (means mention is complete)
      if (!query.includes(" ")) {
        setMentionQuery(query.toLowerCase());
        setMentionStartPos(lastAtIndex);
        setShowMentionDropdown(true);
        return;
      }
    }

    // Hide dropdown if @ is not found or condition not met
    setShowMentionDropdown(false);
  };

  // Insert selected mention into comment
  const handleSelectMention = (collaborator) => {
    const beforeMention = newComment.substring(0, mentionStartPos);
    const afterMention = newComment.substring(
      commentInputRef.current.selectionStart
    );
    const newText = `${beforeMention}@${collaborator.username} ${afterMention}`;

    setNewComment(newText);
    setShowMentionDropdown(false);
    setMentionQuery("");

    // Focus back on textarea
    setTimeout(() => {
      commentInputRef.current?.focus();
      const newCursorPos = mentionStartPos + collaborator.username.length + 2;
      commentInputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Filter collaborators based on query (use real collaborators or orgUsers)
  const collaborators = Array.isArray(task.collaborators)
    ? task.collaborators
    : [];
  const filteredCollaborators = mentionQuery
    ? collaborators.filter(
        (c) =>
          (c.name?.toLowerCase() || "").includes(mentionQuery) ||
          (c.username?.toLowerCase() || "").includes(mentionQuery)
      )
    : collaborators;

  // Parse comment text to highlight @mentions
  const renderCommentText = (text) => {
    if (!text) return "(No comment text)";

    // Split by @ and process
    const parts = text.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith("@")) {
        return (
          <span key={index} className="mention-highlight">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  if (isEditing) {
    return (
      <TaskForm
        task={task}
        onSubmit={handleUpdate}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="task-details-overlay">
      <div className="task-details-modal">
        <div className="details-header">
          <div className="header-left">
            <div
              className="priority-indicator large"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
              title={`${task.priority} priority`}
            ></div>
            <div>
              <h2>{task.title}</h2>
              <div className="task-meta-info">
                <span className="task-id">#{task.id}</span>
                <span className={`task-status ${task.status}`}>
                  {columns.find((col) => col.id === task.status)?.title}
                </span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button
              onClick={() => setIsEditing(true)}
              className="btn secondary"
            >
              Edit
            </button>
            <button onClick={onClose} className="close-btn">
              ×
            </button>
          </div>
        </div>

        <div className="details-content">
          <div className="details-main">
            <section className="description-section">
              <h3>Description</h3>
              <p className="task-description">
                {task.description || "No description provided."}
              </p>
            </section>

            <section className="activity-section">
              <h3>Activity</h3>
              <div className="activity-timeline">
                <div className="activity-item">
                  <div className="activity-icon">📝</div>
                  <div className="activity-content">
                    <p>
                      Task created
                      {task.createdBy?.name && <> by {task.createdBy.name}</>}
                    </p>
                    <small>
                      {task.createdAt
                        ? getTimeAgo(task.createdAt)
                        : "Unknown time"}
                    </small>
                  </div>
                </div>
                {task.assignee && (
                  <div className="activity-item">
                    <div className="activity-icon">👤</div>
                    <div className="activity-content">
                      <p>Assigned to {task.assignee?.name || "Someone"}</p>
                      <small>
                        {task.updatedAt && task.createdAt !== task.updatedAt
                          ? getTimeAgo(task.updatedAt)
                          : task.createdAt
                          ? getTimeAgo(task.createdAt)
                          : "Unknown time"}
                      </small>
                    </div>
                  </div>
                )}
                <div className="activity-item">
                  <div className="activity-icon">📊</div>
                  <div className="activity-content">
                    <p>
                      Current status:{" "}
                      {columns.find((col) => col.id === task.status)?.title ||
                        task.status}
                    </p>
                    <small>
                      {task.updatedAt
                        ? getTimeAgo(task.updatedAt)
                        : task.createdAt
                        ? getTimeAgo(task.createdAt)
                        : "Unknown time"}
                    </small>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="details-sidebar">
            <section className="assignee-section">
              <h4>Assignee</h4>
              {task.assignee ? (
                <div className="assignee-info">
                  <div className="assignee-avatar">
                    {task.assignee.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{task.assignee.name}</span>
                </div>
              ) : (
                <p>Unassigned</p>
              )}
            </section>

            <section className="collaborators-section">
              <div className="section-header">
                <h4>Collaborators</h4>
                {(task.assignee?._id === user?._id ||
                  task.createdBy?._id === user?._id) && (
                  <button
                    className="add-collaborator-btn"
                    onClick={() => setShowAddCollaborator(!showAddCollaborator)}
                    title="Add collaborator"
                  >
                    +
                  </button>
                )}
              </div>

              {showAddCollaborator && (
                <div className="add-collaborator-dropdown">
                  {orgUsers
                    .filter(
                      (orgUser) =>
                        orgUser._id !== task.assignee?._id &&
                        !task.collaborators?.some(
                          (collab) => collab._id === orgUser._id
                        )
                    )
                    .map((orgUser) => (
                      <div
                        key={orgUser._id}
                        className="user-option"
                        onClick={() => handleAddCollaborator(orgUser._id)}
                      >
                        <div className="user-avatar-small">
                          {orgUser.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{orgUser.name}</span>
                      </div>
                    ))}
                  {orgUsers.filter(
                    (orgUser) =>
                      orgUser._id !== task.assignee?._id &&
                      !task.collaborators?.some(
                        (collab) => collab._id === orgUser._id
                      )
                  ).length === 0 && (
                    <p className="no-users">No users available</p>
                  )}
                </div>
              )}

              <div className="collaborators-list">
                {task.collaborators && task.collaborators.length > 0 ? (
                  task.collaborators.map((collaborator) => (
                    <div key={collaborator._id} className="collaborator-item">
                      <div className="collaborator-info">
                        <div className="collaborator-avatar">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{collaborator.name}</span>
                      </div>
                      {(task.assignee?._id === user?._id ||
                        task.createdBy?._id === user?._id) && (
                        <button
                          className="remove-btn"
                          onClick={() =>
                            handleRemoveCollaborator(collaborator._id)
                          }
                          title="Remove collaborator"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="no-collaborators">No collaborators</p>
                )}
              </div>
            </section>

            <section className="status-section">
              <h4>Status</h4>
              <select
                value={task.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="status-select"
              >
                {columns.map((column) => (
                  <option key={column.id} value={column.id}>
                    {column.title}
                  </option>
                ))}
              </select>
            </section>

            <section className="priority-section">
              <h4>Priority</h4>
              <div className="priority-display">
                <div
                  className="priority-indicator"
                  style={{ backgroundColor: getPriorityColor(task.priority) }}
                ></div>
                <span className="priority-text">
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}
                </span>
              </div>
            </section>

            <section className="due-date-section">
              <h4>Due Date</h4>
              <div
                className={`due-date ${
                  isOverdue(task.dueDate) ? "overdue" : ""
                }`}
              >
                {formatDate(task.dueDate)}
                {isOverdue(task.dueDate) && (
                  <span className="overdue-badge">Overdue</span>
                )}
              </div>
            </section>

            {task.tags && task.tags.length > 0 && (
              <section className="tags-section">
                <h4>Tags</h4>
                <div className="task-tags">
                  {task.tags.map((tag, index) => (
                    <span key={index} className="task-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="comments-section">
              <h4>Comments ({comments.length})</h4>

              {/* Comment Input Form */}
              <form onSubmit={handleAddComment} className="comment-form">
                <div className="comment-input-wrapper">
                  <textarea
                    ref={commentInputRef}
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Add a comment... (Type @ to mention)"
                    className="comment-input"
                    rows="3"
                  />
                  {showMentionDropdown && filteredCollaborators.length > 0 && (
                    <div className="mention-dropdown">
                      {filteredCollaborators.map((collaborator) => (
                        <div
                          key={collaborator.id}
                          className="mention-item"
                          onClick={() => handleSelectMention(collaborator)}
                        >
                          <div className="mention-avatar">
                            {collaborator.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="mention-info">
                            <div className="mention-name">
                              {collaborator.name}
                            </div>
                            <div className="mention-username">
                              @{collaborator.username}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="btn primary comment-submit-btn"
                  disabled={!newComment.trim() || isAddingComment}
                >
                  {isAddingComment ? "Posting..." : "Post Comment"}
                </button>
              </form>

              {/* Comments List */}
              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="no-comments">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id || comment.id}
                      className="comment-item"
                    >
                      <div className="comment-header">
                        <div className="comment-author">
                          <div className="comment-avatar">
                            {(() => {
                              const author =
                                comment.user?.name ||
                                comment.author ||
                                "Unknown";
                              return typeof author === "string"
                                ? author.charAt(0).toUpperCase()
                                : "?";
                            })()}
                          </div>
                          <span className="comment-author-name">
                            {comment.user?.name ||
                              comment.author ||
                              "Unknown User"}
                          </span>
                        </div>
                        <span className="comment-time">
                          {getTimeAgo(comment.timestamp || comment.createdAt)}
                        </span>
                      </div>
                      <div className="comment-text">
                        {renderCommentText(comment.text)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="actions-section">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn danger full-width"
              >
                Delete Task
              </button>
            </section>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm-overlay">
            <div className="delete-confirm-modal">
              <h3>Delete Task</h3>
              <p>
                Are you sure you want to delete "{task.title}"? This action
                cannot be undone.
              </p>
              <div className="confirm-actions">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn secondary"
                >
                  Cancel
                </button>
                <button onClick={handleDelete} className="btn danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetails;
