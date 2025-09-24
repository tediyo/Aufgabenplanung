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
    // Add authentication token from sessionStorage
    const token = sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added auth token to request');
    } else {
      console.log('⚠️ No auth token found in sessionStorage');
    }
    
    console.log('📡 API Request:', config.method?.toUpperCase(), config.url);
    console.log('📡 Full URL:', config.baseURL + config.url);
    console.log('📡 Request data:', config.data);
    return config;
  },
  (error) => {
    console.log('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📡 API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ API Error:', error.response?.status, error.config?.url, error.message);
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      console.log('🔒 Unauthorized access - redirecting to login');
      sessionStorage.removeItem('authToken');
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
  createTask: (taskData) => {
    console.log('📤 Creating task with data:', taskData);
    return api.post('/tasks', taskData);
  },
  updateTask: (id, taskData) => {
    console.log('📤 Updating task', id, 'with data:', taskData);
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



