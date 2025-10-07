import React, { useState, useEffect } from "react";
import ProjectForm from "./ProjectForm";
import { tasksAPI } from "../../services/api";

const ProjectDetailsModal = ({ project, onClose, onUpdate, onDelete }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [realTimeCounts, setRealTimeCounts] = useState({
    tasksCount: project.tasksCount || 0,
    completedTasks: project.completedTasks || 0,
  });
  const [loadingCounts, setLoadingCounts] = useState(true);

  // Fetch real-time task counts from the database
  useEffect(() => {
    const fetchTaskCounts = async () => {
      try {
        setLoadingCounts(true);
        const tasks = await tasksAPI.getAll();

        // Filter tasks that belong to this project (by project ID or name)
        // Use flexible _id || id pattern for MongoDB compatibility
        const projectId = (project._id || project.id).toString();
        const projectTasks = tasks.filter(
          (task) => task.project === projectId || task.project === project.name
        );

        // Count total tasks and completed tasks
        const totalTasks = projectTasks.length;
        const completed = projectTasks.filter(
          (task) => task.status === "done"
        ).length;

        setRealTimeCounts({
          tasksCount: totalTasks,
          completedTasks: completed,
        });
      } catch (error) {
        console.error("Error fetching task counts:", error);
        // Fallback to project's stored counts
        setRealTimeCounts({
          tasksCount: project.tasksCount || 0,
          completedTasks: project.completedTasks || 0,
        });
      } finally {
        setLoadingCounts(false);
      }
    };

    fetchTaskCounts();
  }, [
    project._id,
    project.id,
    project.name,
    project.tasksCount,
    project.completedTasks,
  ]);

  if (!project) return null;

  const getStatusColor = (status) => {
    const colors = {
      planning: "#6b7280",
      active: "#10b981",
      "on-hold": "#f59e0b",
      completed: "#3b82f6",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusLabel = (status) => {
    const labels = {
      planning: "Planning",
      active: "Active",
      "on-hold": "On Hold",
      completed: "Completed",
    };
    return labels[status] || status;
  };

  const handleUpdateProject = (projectData) => {
    onUpdate(projectData);
    setShowEditForm(false);
  };

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      onDelete(project.id);
      onClose();
    }
  };

  // Use real-time counts for progress calculation
  const progressPercentage =
    realTimeCounts.tasksCount > 0
      ? Math.round(
          (realTimeCounts.completedTasks / realTimeCounts.tasksCount) * 100
        )
      : 0;

  return (
    <>
      <div
        className="project-details-modal-overlay"
        onClick={(e) => {
          if (e.target.className === "project-details-modal-overlay") {
            onClose();
          }
        }}
      >
        <div
          className="project-details-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="project-details-modal-header">
            <div className="modal-header-left">
              <h2 className="modal-project-title">{project.name}</h2>
              <span
                className="project-status-badge"
                style={{ backgroundColor: getStatusColor(project.status) }}
              >
                {getStatusLabel(project.status)}
              </span>
            </div>
            <div className="modal-header-actions">
              <button
                className="btn secondary btn-sm"
                onClick={() => setShowEditForm(true)}
              >
                ✏️ Edit
              </button>
              <button
                className="btn danger btn-sm"
                onClick={handleDeleteProject}
              >
                🗑️ Delete
              </button>
              <button
                className="modal-close-btn"
                onClick={onClose}
                title="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="project-details-modal-body">
            {/* Description Section */}
            <div className="modal-section">
              <h3 className="modal-section-title">Description</h3>
              <p className="modal-section-content">
                {project.description || "No description provided"}
              </p>
            </div>

            {/* Info Grid */}
            <div className="modal-info-grid">
              {/* Project Info */}
              <div className="modal-section">
                <h3 className="modal-section-title">Project Information</h3>
                <div className="modal-info-list">
                  <div className="modal-info-item">
                    <span className="info-label">Color</span>
                    <div className="info-value-color">
                      <span
                        className="color-swatch-small"
                        style={{ backgroundColor: project.color }}
                      ></span>
                      <span>{project.color}</span>
                    </div>
                  </div>
                  <div className="modal-info-item">
                    <span className="info-label">Created</span>
                    <span className="info-value">
                      {new Date(project.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="modal-section">
                <h3 className="modal-section-title">Timeline</h3>
                <div className="modal-info-list">
                  <div className="modal-info-item">
                    <span className="info-label">Start Date</span>
                    <span className="info-value">
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Not set"}
                    </span>
                  </div>
                  <div className="modal-info-item">
                    <span className="info-label">End Date</span>
                    <span className="info-value">
                      {project.endDate
                        ? new Date(project.endDate).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Not set"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="modal-section">
              <h3 className="modal-section-title">Project Progress</h3>
              {loadingCounts ? (
                <div
                  className="loading-indicator"
                  style={{
                    textAlign: "center",
                    padding: "2rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Loading task counts...
                </div>
              ) : (
                <>
                  <div className="modal-progress-stats">
                    <div className="progress-stat-item">
                      <span className="stat-value-large">
                        {realTimeCounts.tasksCount}
                      </span>
                      <span className="stat-label-small">Total Tasks</span>
                    </div>
                    <div className="progress-stat-item">
                      <span className="stat-value-large">
                        {realTimeCounts.completedTasks}
                      </span>
                      <span className="stat-label-small">Completed</span>
                    </div>
                    <div className="progress-stat-item">
                      <span className="stat-value-large">
                        {progressPercentage}%
                      </span>
                      <span className="stat-label-small">Progress</span>
                    </div>
                  </div>

                  <div className="modal-progress-bar-wrapper">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${progressPercentage}%`,
                          backgroundColor: project.color,
                        }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Tasks Section */}
            <div className="modal-section">
              <h3 className="modal-section-title">Tasks</h3>
              <div className="modal-tasks-placeholder">
                <p className="placeholder-text">
                  📋 Task management for this project can be accessed from the
                  TaskBoard.
                </p>
                <p className="placeholder-subtext">
                  {loadingCounts ? (
                    "Loading task counts..."
                  ) : (
                    <>
                      {realTimeCounts.completedTasks} of{" "}
                      {realTimeCounts.tasksCount} tasks completed
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <ProjectForm
          onSubmit={handleUpdateProject}
          onCancel={() => setShowEditForm(false)}
          project={project}
        />
      )}
    </>
  );
};

export default ProjectDetailsModal;
