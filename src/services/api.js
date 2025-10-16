import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Try to get token from auth object first
    const auth = localStorage.getItem("auth");
    if (auth) {
      try {
        const { token } = JSON.parse(auth);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      } catch (e) {
        console.error("Error parsing auth:", e);
      }
    }

    // Fallback to standalone token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Track if we're already refreshing to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors (backend down)
    if (!error.response) {
      console.error("Network error - backend may be down:", error.message);
      return Promise.reject(
        new Error("Unable to connect to server. Please check your connection.")
      );
    }

    // If 401 error and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { token, user } = response.data;

        // Update stored auth data
        const authData = {
          token,
          user,
          organization: user.organization,
        };
        localStorage.setItem("auth", JSON.stringify(authData));

        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Process queued requests
        processQueue(null, token);
        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Process queued requests with error
        processQueue(refreshError, null);
        isRefreshing = false;

        // Refresh failed - clear auth and redirect (only once)
        if (!window.__logoutInProgress) {
          window.__logoutInProgress = true;
          localStorage.removeItem("auth");
          localStorage.removeItem("token");

          // Small delay to allow current renders to complete
          setTimeout(() => {
            window.location.href = "/auth";
          }, 100);
        }

        return Promise.reject(refreshError);
      }
    }

    // For other errors, just pass them through
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (name, email, password, organizationId) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      organizationId,
    });
    return response.data;
  },

  registerOrganization: async (
    organizationName,
    domain,
    name,
    email,
    password,
    plan
  ) => {
    const response = await api.post("/auth/organization/register", {
      organizationName,
      domain,
      name,
      email,
      password,
      plan,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post("/auth/refresh");
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  validateResetToken: async (token) => {
    const response = await api.get(`/auth/reset-password/${token}`);
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post(`/auth/reset-password/${token}`, {
      password: newPassword,
    });
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get("/tasks", { params: filters });
    return response.data;
  },

  search: async (searchQuery) => {
    const response = await api.get("/tasks", {
      params: { search: searchQuery },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  addComment: async (id, text) => {
    const response = await api.post(`/tasks/${id}/comments`, { text });
    return response.data;
  },

  addCollaborator: async (id, userId) => {
    const response = await api.post(`/tasks/${id}/collaborators`, { userId });
    return response.data;
  },

  removeCollaborator: async (id, userId) => {
    const response = await api.delete(`/tasks/${id}/collaborators/${userId}`);
    return response.data;
  },
};

// Organizations API
export const organizationsAPI = {
  getAll: async () => {
    const response = await api.get("/organizations");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },

  update: async (id, orgData) => {
    const response = await api.put(`/organizations/${id}`, orgData);
    return response.data;
  },

  getUsers: async (id) => {
    const response = await api.get(`/organizations/${id}/users`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", "avatar");

    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Files API
export const filesAPI = {
  upload: async (file, fileType = "attachment") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);

    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/files/${id}`, {
      responseType: "blob",
    });
    return response.data;
  },

  getMetadata: async (id) => {
    const response = await api.get(`/files/metadata/${id}`);
    return response.data;
  },

  getAll: async (fileType) => {
    const response = await api.get("/files", {
      params: fileType ? { fileType } : {},
    });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  getFileUrl: (fileId) => {
    return `${API_URL}/files/${fileId}`;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/notifications/mark-all-read");
    return response.data;
  },

  performAction: async (id, action) => {
    const response = await api.put(`/notifications/${id}/action`, { action });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  create: async (notificationData) => {
    const response = await api.post("/notifications/create", notificationData);
    return response.data;
  },
};

// Invites API
export const invitesAPI = {
  create: async (email, role = "member") => {
    const response = await api.post("/invites/create", { email, role });
    return response.data;
  },

  validate: async (code) => {
    const response = await api.get(`/invites/validate/${code}`);
    return response.data;
  },

  accept: async (code, userData) => {
    const response = await api.post(`/invites/accept/${code}`, userData);
    return response.data;
  },

  list: async () => {
    const response = await api.get("/invites/list");
    return response.data;
  },

  revoke: async (code) => {
    const response = await api.delete(`/invites/${code}`);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getAll: async () => {
    const response = await api.get("/projects");
    return response.data;
  },

  search: async (searchQuery) => {
    const response = await api.get("/projects", {
      params: { search: searchQuery },
    });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  create: async (projectData) => {
    const response = await api.post("/projects", projectData);
    return response.data;
  },

  update: async (id, projectData) => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },

  addCollaborator: async (id, userId) => {
    const response = await api.post(`/projects/${id}/collaborators`, {
      userId,
    });
    return response.data;
  },

  removeCollaborator: async (id, userId) => {
    const response = await api.delete(
      `/projects/${id}/collaborators/${userId}`
    );
    return response.data;
  },
};

export default api;
