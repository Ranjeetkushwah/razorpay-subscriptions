import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: '/api',
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
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
};

// Plan APIs
export const planAPI = {
  getPlans: () => api.get('/plans'),
  getPlanById: (id) => api.get(`/plans/${id}`),
  createPlan: (planData) => api.post('/plans', planData),
  updatePlan: (id, planData) => api.put(`/plans/${id}`, planData),
  deletePlan: (id) => api.delete(`/plans/${id}`),
  getStats: () => api.get('/plans/stats'),
};

// Subscription APIs
export const subscriptionAPI = {
  getUserSubscriptions: () => api.get('/subscriptions/my-subscriptions'),
  createSubscription: (subscriptionData) => api.post('/subscriptions/create', subscriptionData),
  getSubscription: (id) => api.get(`/subscriptions/${id}`),
  cancelSubscription: (id, cancelAtCycleEnd = false) => 
    api.post(`/subscriptions/${id}/cancel`, { cancelAtCycleEnd }),
  pauseSubscription: (id) => api.post(`/subscriptions/${id}/pause`),
  resumeSubscription: (id) => api.post(`/subscriptions/${id}/resume`),
  upgradeSubscription: (id, newPlanId) => api.put(`/subscriptions/${id}/upgrade`, { newPlanId }),
  
  getAllSubscriptions: (params) => api.get('/subscriptions/admin/all', { params }),
};

export default api;
