import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";
import ProjectForm from "./ProjectForm";
import { projectsAPI } from "../../services/api";
import { handleError } from "../../utils/errorHandler";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editing, setEditing] = useState({
    name: false,
    description: false,
    status: false,
    startDate: false,
    endDate: false,
  });
  const [editValues, setEditValues] = useState({
    name: "",
    description: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    // Fetch project from API
    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await projectsAPI.getById(projectId);
        setProject(data);
        setEditValues({
          name: data.name,
          description: data.description || "",
          status: data.status,
          startDate: data.startDate || "",
          endDate: data.endDate || "",
        });
      } catch (error) {
        console.error("Error fetching project:", error);
        // Fallback to localStorage if API fails
        const storedProjects = localStorage.getItem("projects");
        if (storedProjects) {
          const projects = JSON.parse(storedProjects);
          const foundProject = projects.find(
            (p) => p.id === parseInt(projectId)
          );
          if (foundProject) {
            setProject(foundProject);
            setEditValues({
              name: foundProject.name,
              description: foundProject.description || "",
              status: foundProject.status,
              startDate: foundProject.startDate || "",
              endDate: foundProject.endDate || "",
            });
          } else {
            navigate("/projects");
          }
        } else {
          navigate("/projects");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  // Start editing a field
  const startEdit = (field) => {
    setEditing({ ...editing, [field]: true });
  };

  // Cancel editing
  const cancelEdit = (field) => {
    setEditing({ ...editing, [field]: false });
    // Reset to original value
    setEditValues({
      ...editValues,
      [field]: project[field] || "",
    });
  };

  // Save inline edit
  const saveInlineEdit = async (field) => {
    try {
      const updateData = { [field]: editValues[field] };
      const updatedProject = await projectsAPI.update(
        project._id || project.id,
        updateData
      );
      setProject({ ...project, ...updatedProject });
      setEditing({ ...editing, [field]: false });
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      toast.showError(handleError(error, `Update ${field}`));
      // Fallback to localStorage
      const storedProjects = localStorage.getItem("projects");
      if (storedProjects) {
        const projects = JSON.parse(storedProjects);
        const updatedProjects = projects.map((p) =>
          p.id === project.id ? { ...p, [field]: editValues[field] } : p
        );
        localStorage.setItem("projects", JSON.stringify(updatedProjects));
        setProject({ ...project, [field]: editValues[field] });
        setEditing({ ...editing, [field]: false });
      }
    }
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditValues({ ...editValues, [field]: value });
  };

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
            {editing.name ? (
              <div className="inline-edit-group">
                <input
                  type="text"
                  value={editValues.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="inline-edit-input title-input"
                  autoFocus
                />
                <button
                  className="btn small primary"
                  onClick={() => saveInlineEdit("name")}
                >
                  ✓
                </button>
                <button
                  className="btn small secondary"
                  onClick={() => cancelEdit("name")}
                >
                  ✕
                </button>
              </div>
            ) : (
              <h1
                className="project-title editable"
                onClick={() => startEdit("name")}
                title="Click to edit"
              >
                {project.name}
              </h1>
            )}

            {editing.status ? (
              <div className="inline-edit-group">
                <select
                  value={editValues.status}
                  onChange={(e) => handleInputChange("status", e.target.value)}
                  className="inline-edit-select"
                  autoFocus
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
                </select>
                <button
                  className="btn small primary"
                  onClick={() => saveInlineEdit("status")}
                >
                  ✓
                </button>
                <button
                  className="btn small secondary"
                  onClick={() => cancelEdit("status")}
                >
                  ✕
                </button>
              </div>
            ) : (
              <span
                className="project-status-badge editable"
                style={{
                  backgroundColor: getStatusColor(project.status),
                }}
                onClick={() => startEdit("status")}
                title="Click to change status"
              >
                {getStatusLabel(project.status)}
              </span>
            )}
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
          {editing.description ? (
            <div className="inline-edit-group">
              <textarea
                value={editValues.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="inline-edit-textarea"
                rows="4"
                autoFocus
              />
              <div className="inline-edit-actions">
                <button
                  className="btn small primary"
                  onClick={() => saveInlineEdit("description")}
                >
                  Save
                </button>
                <button
                  className="btn small secondary"
                  onClick={() => cancelEdit("description")}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className="project-full-description editable"
              onClick={() => startEdit("description")}
              title="Click to edit"
            >
              {project.description ||
                "No description provided. Click to add one."}
            </p>
          )}
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
            <div className="info-item">
              <span className="info-label">Start Date</span>
              {editing.startDate ? (
                <div className="inline-edit-group-small">
                  <input
                    type="date"
                    value={editValues.startDate}
                    onChange={(e) =>
                      handleInputChange("startDate", e.target.value)
                    }
                    className="inline-edit-input-small"
                  />
                  <button
                    className="btn small primary"
                    onClick={() => saveInlineEdit("startDate")}
                  >
                    ✓
                  </button>
                  <button
                    className="btn small secondary"
                    onClick={() => cancelEdit("startDate")}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span
                  className="info-value editable"
                  onClick={() => startEdit("startDate")}
                  title="Click to edit"
                >
                  {project.startDate
                    ? new Date(project.startDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not set - Click to add"}
                </span>
              )}
            </div>
            <div className="info-item">
              <span className="info-label">End Date</span>
              {editing.endDate ? (
                <div className="inline-edit-group-small">
                  <input
                    type="date"
                    value={editValues.endDate}
                    onChange={(e) =>
                      handleInputChange("endDate", e.target.value)
                    }
                    className="inline-edit-input-small"
                  />
                  <button
                    className="btn small primary"
                    onClick={() => saveInlineEdit("endDate")}
                  >
                    ✓
                  </button>
                  <button
                    className="btn small secondary"
                    onClick={() => cancelEdit("endDate")}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <span
                  className="info-value editable"
                  onClick={() => startEdit("endDate")}
                  title="Click to edit"
                >
                  {project.endDate
                    ? new Date(project.endDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Not set - Click to add"}
                </span>
              )}
            </div>
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
