import axios from 'axios';

// Use environment variable for API URL, fallback to relative path for development (uses proxy)
const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Add authentication token from sessionStorage
    const token = sessionStorage.getItem('authToken');
    const userEmail = sessionStorage.getItem('userEmail');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (userEmail) {
      // Fallback demo auth via email header (server supports this in dev)
      config.headers['X-User-Email'] = userEmail;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors without immediate redirect
    if (error.response?.status === 401) {
      // Do not clear session or redirect automatically to avoid bounce loop
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  updatePreferences: (preferences) => api.put('/auth/preferences', preferences),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => {
    return api.post('/tasks', taskData);
  },
  updateTask: (id, taskData) => {
    return api.put(`/tasks/${id}`, taskData);
  },
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  bulkDeleteTasks: (taskIds) => api.delete('/tasks/bulk', { data: { taskIds } }),
  cleanupCompletedTasks: () => api.delete('/tasks/cleanup/completed'),
  cleanupOldTasks: (days) => api.delete(`/tasks/cleanup/old?days=${days}`),
  startTimer: (id, description) => api.post(`/tasks/${id}/start-timer`, { description }),
  stopTimer: (id) => api.post(`/tasks/${id}/stop-timer`),
  getTemplates: () => api.get('/tasks/templates'),
};

export const futureTasksAPI = {
  getFutureTasks: () => api.get('/future-tasks'),
  createFutureTask: (futureTaskData) => api.post('/future-tasks', futureTaskData),
  updateFutureTask: (id, futureTaskData) => api.put(`/future-tasks/${id}`, futureTaskData),
  deleteFutureTask: (id) => api.delete(`/future-tasks/${id}`),
  toggleFutureTask: (id) => api.patch(`/future-tasks/${id}/toggle`),
};

// Reports API
export const reportsAPI = {
  getDashboard: (params) => api.get('/reports/dashboard', { params }),
  getProductivity: (params) => api.get('/reports/productivity', { params }),
  exportData: (params) => api.get('/reports/export', { 
    params,
    responseType: 'blob'
  }),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  getStats: () => api.get('/notifications/stats'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  cancelNotification: (id) => api.put(`/notifications/${id}/cancel`),
};

export default api;



