import React, { useState } from "react";
import TaskForm from "./TaskForm";

const TaskDetails = ({
  task,
  onClose,
  onUpdate,
  onDelete,
  onMove,
  columns,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
    onUpdate(task.id, updatedData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleStatusChange = (newStatus) => {
    onMove(task.id, newStatus);
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
                    <p>Task created</p>
                    <small>2 days ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">👤</div>
                  <div className="activity-content">
                    <p>Assigned to {task.assignee?.name}</p>
                    <small>2 days ago</small>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📊</div>
                  <div className="activity-content">
                    <p>
                      Status changed to{" "}
                      {columns.find((col) => col.id === task.status)?.title}
                    </p>
                    <small>1 day ago</small>
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
