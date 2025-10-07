import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectForm from "./ProjectForm";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    // Load project from localStorage
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      const projects = JSON.parse(storedProjects);
      const foundProject = projects.find((p) => p.id === parseInt(projectId));
      if (foundProject) {
        setProject(foundProject);
      } else {
        // Project not found, redirect to projects list
        navigate("/projects");
      }
    } else {
      navigate("/projects");
    }
    setLoading(false);
  }, [projectId, navigate]);

  const handleUpdateProject = (projectData) => {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      const projects = JSON.parse(storedProjects);
      const updatedProjects = projects.map((p) =>
        p.id === project.id ? { ...p, ...projectData } : p
      );
      localStorage.setItem("projects", JSON.stringify(updatedProjects));
      setProject({ ...project, ...projectData });
      setShowEditForm(false);
    }
  };

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const storedProjects = localStorage.getItem("projects");
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        const updatedProjects = projects.filter((p) => p.id !== project.id);
        localStorage.setItem("projects", JSON.stringify(updatedProjects));
        navigate("/projects");
      }
    }
  };

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

  if (loading) {
    return (
      <div className="project-details-container">
        <div className="loading-container">
          <p>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const progressPercentage =
    project.tasksCount > 0
      ? Math.round((project.completedTasks / project.tasksCount) * 100)
      : 0;

  return (
    <div className="project-details-container">
      {/* Header Section */}
      <div className="project-details-header">
        <button
          className="btn secondary back-btn"
          onClick={() => navigate("/projects")}
        >
          ← Back to Projects
        </button>

        <div className="project-details-title-section">
          <div className="project-title-group">
            <h1 className="project-title">{project.name}</h1>
            <span
              className="project-status-badge"
              style={{
                backgroundColor: getStatusColor(project.status),
              }}
            >
              {getStatusLabel(project.status)}
            </span>
          </div>

          <div className="project-actions-group">
            <button
              className="btn secondary"
              onClick={() => setShowEditForm(true)}
            >
              ✏️ Edit Project
            </button>
            <button className="btn danger" onClick={handleDeleteProject}>
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>

      {/* Project Overview Section */}
      <div className="project-overview-grid">
        {/* Description Card */}
        <div className="project-detail-card full-width">
          <h3 className="card-title">Description</h3>
          <p className="project-full-description">
            {project.description || "No description provided"}
          </p>
        </div>

        {/* Key Information Card */}
        <div className="project-detail-card">
          <h3 className="card-title">Key Information</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Project Color</span>
              <div className="info-value color-indicator">
                <span
                  className="color-swatch"
                  style={{ backgroundColor: project.color }}
                ></span>
                <span>{project.color}</span>
              </div>
            </div>
            <div className="info-item">
              <span className="info-label">Created</span>
              <span className="info-value">
                {new Date(project.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            {project.startDate && (
              <div className="info-item">
                <span className="info-label">Start Date</span>
                <span className="info-value">
                  {new Date(project.startDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
            {project.endDate && (
              <div className="info-item">
                <span className="info-label">End Date</span>
                <span className="info-value">
                  {new Date(project.endDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress Card */}
        <div className="project-detail-card">
          <h3 className="card-title">Progress Overview</h3>
          <div className="progress-stats">
            <div className="stat-item">
              <span className="stat-value">{project.tasksCount}</span>
              <span className="stat-label">Total Tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{project.completedTasks}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{progressPercentage}%</span>
              <span className="stat-label">Progress</span>
            </div>
          </div>

          <div className="progress-bar-section">
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
        </div>

        {/* Timeline Card */}
        {(project.startDate || project.endDate) && (
          <div className="project-detail-card full-width">
            <h3 className="card-title">Timeline</h3>
            <div className="timeline-visual">
              <div className="timeline-item">
                <div className="timeline-marker start"></div>
                <div className="timeline-content">
                  <span className="timeline-label">Start Date</span>
                  <span className="timeline-date">
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "Not set"}
                  </span>
                </div>
              </div>
              <div className="timeline-line"></div>
              <div className="timeline-item">
                <div className="timeline-marker end"></div>
                <div className="timeline-content">
                  <span className="timeline-label">End Date</span>
                  <span className="timeline-date">
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : "Not set"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tasks Section */}
        <div className="project-detail-card full-width">
          <h3 className="card-title">Tasks</h3>
          <div className="tasks-placeholder">
            <p className="placeholder-text">
              📋 Task management for this project will be integrated with the
              TaskBoard.
            </p>
            <p className="placeholder-subtext">
              Tasks: {project.completedTasks} completed out of{" "}
              {project.tasksCount} total
            </p>
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
    </div>
  );
};

export default ProjectDetails;
