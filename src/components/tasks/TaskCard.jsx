import React, { useState } from "react";
import TaskDetails from "./TaskDetails";

const TaskCard = ({ task, onMove, onUpdate, onDelete, columns }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const handleDragStart = (e) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", task.id.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedTaskId = parseInt(e.dataTransfer.getData("text/plain"));
    const newStatus = e.currentTarget.dataset.status;

    if (draggedTaskId && newStatus && draggedTaskId !== task.id) {
      onMove(draggedTaskId, newStatus);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <div
        className={`task-card ${isDragging ? "dragging" : ""}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        data-status={task.status}
        onClick={() => setShowDetails(true)}
      >
        <div className="task-header">
          <div className="task-priority">
            <div
              className="priority-indicator"
              style={{ backgroundColor: getPriorityColor(task.priority) }}
              title={`${task.priority} priority`}
            ></div>
          </div>

          <div className="task-actions">
            <button
              className="task-action-btn"
              onClick={(e) => {
                e.stopPropagation();
                // Show quick actions menu
              }}
            >
              ⋯
            </button>
          </div>
        </div>

        <div className="task-content">
          <h4 className="task-title">{task.title}</h4>
          <p className="task-description">{task.description}</p>
        </div>

        <div className="task-meta">
          {task.tags && task.tags.length > 0 && (
            <div className="task-tags">
              {task.tags.slice(0, 2).map((tag, index) => (
                <span key={index} className="task-tag">
                  {tag}
                </span>
              ))}
              {task.tags.length > 2 && (
                <span className="task-tag more">+{task.tags.length - 2}</span>
              )}
            </div>
          )}

          <div className="task-footer">
            {task.assignee && (
              <div className="task-assignee">
                <div className="assignee-avatar">
                  {task.assignee.name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}

            {task.dueDate && (
              <div
                className={`task-due-date ${
                  isOverdue(task.dueDate) ? "overdue" : ""
                }`}
              >
                {formatDate(task.dueDate)}
              </div>
            )}
          </div>
        </div>

        <div className="task-status-actions">
          <select
            value={task.status}
            onChange={(e) => {
              e.stopPropagation();
              onMove(task.id, e.target.value);
            }}
            className="status-select"
            onClick={(e) => e.stopPropagation()}
          >
            {columns.map((column) => (
              <option key={column.id} value={column.id}>
                {column.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showDetails && (
        <TaskDetails
          task={task}
          onClose={() => setShowDetails(false)}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onMove={onMove}
          columns={columns}
        />
      )}
    </>
  );
};

export default TaskCard;
