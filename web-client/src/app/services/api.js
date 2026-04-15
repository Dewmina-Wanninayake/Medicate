import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Attach token to every request automatically ──────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Auto refresh token on 401 ────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth endpoints ───────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
  logout:   ()     => api.post('/auth/logout'),
  getMe:    ()     => api.get('/auth/me'),
  refresh:  (data) => api.post('/auth/refresh', data),
};

// ── User endpoints ───────────────────────────────────────────────
export const userAPI = {
  getProfile:      ()     => api.get('/users/profile'),
  updateProfile:   (data) => api.put('/users/profile', data),
  changePassword:  (data) => api.put('/users/change-password', data),
  listDoctors:     (params) => api.get('/users/doctors', { params }),
  getDoctorById:   (id)   => api.get(`/users/doctors/${id}`),
};

// ── Admin endpoints ──────────────────────────────────────────────
export const adminAPI = {
  getStats:         ()     => api.get('/admin/stats'),
  listUsers:        (params) => api.get('/admin/users', { params }),
  getUserById:      (id)   => api.get(`/admin/users/${id}`),
  deleteUser:       (id)   => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id)   => api.put(`/admin/users/${id}/toggle-status`),
  getPendingDoctors:()     => api.get('/admin/doctors/pending'),
  verifyDoctor:     (id)   => api.put(`/admin/doctors/${id}/verify`),
  rejectDoctor:     (id)   => api.put(`/admin/doctors/${id}/reject`),
};

export default api;