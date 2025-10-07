import React, { useState, useEffect } from "react";
import ProjectForm from "./ProjectForm";
import ProjectDetailsModal from "./ProjectDetailsModal";
import { projectsAPI } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { handleError, successMessages } from "../../utils/errorHandler";

const Projects = () => {
  const toast = useToast();
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsAPI.getAll();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.showError(handleError(error, "Load Projects"));
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [toast]);

  const handleCreateProject = async (projectData) => {
    try {
      const newProject = await projectsAPI.create({
        ...projectData,
        createdAt: new Date().toISOString(),
        tasksCount: 0,
        completedTasks: 0,
      });
      setProjects([...projects, newProject]);
      setShowProjectForm(false);
      toast.showSuccess(successMessages.projectCreated);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.showError(handleError(error, "Create Project"));
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      const updatedProject = await projectsAPI.update(
        selectedProject._id || selectedProject.id,
        projectData
      );
      const updatedProjects = projects.map((p) =>
        (p._id || p.id) === (selectedProject._id || selectedProject.id)
          ? { ...p, ...updatedProject }
          : p
      );
      setProjects(updatedProjects);
      setSelectedProject(null);
      setShowProjectForm(false);
      toast.showSuccess(successMessages.projectUpdated);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.showError(handleError(error, "Update Project"));
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await projectsAPI.delete(projectId);
        const updatedProjects = projects.filter(
          (p) => (p._id || p.id) !== projectId
        );
        setProjects(updatedProjects);
        toast.showSuccess(successMessages.projectDeleted);
      } catch (error) {
        console.error("Error deleting project:", error);
        toast.showError(handleError(error, "Delete Project"));
      }
    }
  };

  const openEditForm = (project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  const handleProjectClick = (project) => {
    // Show project details in modal
    setViewingProject(project);
  };

  const closeForm = () => {
    setSelectedProject(null);
    setShowProjectForm(false);
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
      <div className="projects-container">
        <div className="loading-container">
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div>
          <h2>Projects</h2>
          <p>Manage and track all your team's projects</p>
        </div>
        <button
          className="btn primary"
          onClick={() => setShowProjectForm(true)}
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started organizing tasks</p>
          <button
            className="btn primary"
            onClick={() => setShowProjectForm(true)}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              style={{ borderLeft: `4px solid ${project.color}` }}
              onClick={() => handleProjectClick(project)}
            >
              <div className="project-header">
                <div>
                  <h3>{project.name}</h3>
                  <span
                    className="project-status"
                    style={{
                      background: getStatusColor(project.status),
                      color: "white",
                    }}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <div className="project-actions">
                  <button
                    className="btn icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project);
                    }}
                    title="View details"
                  >
                    ℹ️
                  </button>
                  <button
                    className="btn icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditForm(project);
                    }}
                    title="Edit project"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    title="Delete project"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="project-description">{project.description}</p>
              )}

              <div className="project-meta">
                {project.startDate && (
                  <div className="meta-item">
                    <span className="meta-label">Start:</span>
                    <span className="meta-value">
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {project.endDate && (
                  <div className="meta-item">
                    <span className="meta-label">End:</span>
                    <span className="meta-value">
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="project-progress">
                <div className="progress-info">
                  <span>Project Progress</span>
                  <span>
                    {project.completedTasks}/{project.tasksCount}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        project.tasksCount > 0
                          ? (project.completedTasks / project.tasksCount) * 100
                          : 0
                      }%`,
                      backgroundColor: project.color,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showProjectForm && (
        <ProjectForm
          onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
          onCancel={closeForm}
          project={selectedProject}
        />
      )}

      {viewingProject && (
        <ProjectDetailsModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          onUpdate={(projectData) => {
            const updatedProjects = projects.map((p) =>
              (p._id || p.id) === (viewingProject._id || viewingProject.id)
                ? { ...p, ...projectData }
                : p
            );
            setProjects(updatedProjects);
            setViewingProject({ ...viewingProject, ...projectData });
          }}
          onDelete={(projectId) => {
            const updatedProjects = projects.filter(
              (p) => (p._id || p.id) !== projectId
            );
            setProjects(updatedProjects);
            setViewingProject(null);
          }}
        />
      )}
    </div>
  );
};

export default Projects;
