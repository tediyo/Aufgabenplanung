import axios from 'axios';

// Development API URL for testing
//const API_BASE_URL = 'http://localhost:5000/api';
// Production API URL
const API_BASE_URL = 'https://aufgabenplanung.onrender.com/api';

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
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post('/tasks', taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  bulkDeleteTasks: (taskIds) => api.delete('/tasks/bulk', { data: { taskIds } }),
  cleanupCompletedTasks: () => api.delete('/tasks/cleanup/completed'),
  cleanupOldTasks: (days) => api.delete(`/tasks/cleanup/old?days=${days}`),
  startTimer: (id, description) => api.post(`/tasks/${id}/start-timer`, { description }),
  stopTimer: (id) => api.post(`/tasks/${id}/stop-timer`),
  getTemplates: () => api.get('/tasks/templates'),
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



