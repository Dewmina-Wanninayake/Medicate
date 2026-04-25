import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes('/api/auth/login') || err.config?.url?.includes('/api/auth/register');
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }).then((r) => r.data),

  register: (payload) =>
    api.post('/api/auth/register', payload).then((r) => r.data),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getMe: () => api.get('/api/users/me').then((r) => r.data),
  updateMe: (data) => api.put('/api/users/me', data).then((r) => r.data),
};

// ── Doctors ───────────────────────────────────────────────────────────────────
export const doctorsAPI = {
  listPublic: (specialization) =>
    api
      .get('/api/doctors/public', { params: specialization ? { specialization } : {} })
      .then((r) => r.data),
  getById: (id) => api.get(`/api/doctors/${id}`).then((r) => r.data),
  setAvailability: (availability) =>
    api.put('/api/doctors/availability', { availability }).then((r) => r.data),
};

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  listUsers: (params) => api.get('/api/admin/users', { params }).then((r) => r.data),
  verifyDoctor: (id) => api.patch(`/api/admin/doctors/${id}/verify`).then((r) => r.data),
  toggleStatus: (id, isActive) =>
    api.patch(`/api/admin/users/${id}/status`, { isActive }).then((r) => r.data),
  deleteUser: (id) => api.delete(`/api/admin/users/${id}`).then((r) => r.data),
  updateUser: (id, data) => api.put(`/api/admin/users/${id}`, data).then((r) => r.data),
};

// ── Appointments ──────────────────────────────────────────────────────────────
export const appointmentsAPI = {
  book: (data) => api.post('/api/appointments', data).then((r) => r.data),
  list: (params) => api.get('/api/appointments', { params }).then((r) => r.data),
  getById: (id) => api.get(`/api/appointments/${id}`).then((r) => r.data),
  updateStatus: (id, status, extra = {}) =>
    api.patch(`/api/appointments/${id}/status`, { status, ...extra }).then((r) => r.data),
  cancel: (id, cancellationReason) =>
    api.delete(`/api/appointments/${id}`, { data: { cancellationReason } }).then((r) => r.data),
  getDoctorAvailability: (doctorId) => api.get(`/api/appointments/doctor/${doctorId}/availability`).then((r) => r.data),
  addChat: (id, message) =>
    api.post(`/api/appointments/${id}/chat`, { message }).then((r) => r.data),
};

// ── Sessions ──────────────────────────────────────────────────────────────────
export const sessionsAPI = {
  start: (appointmentId) =>
    api.post(`/api/sessions/start/${appointmentId}`).then((r) => r.data),
  getToken: (appointmentId) =>
    api.get(`/api/sessions/token/${appointmentId}`).then((r) => r.data),
  end: (appointmentId) =>
    api.post(`/api/sessions/end/${appointmentId}`).then((r) => r.data),
  getStatus: (appointmentId) =>
    api.get(`/api/sessions/status/${appointmentId}`).then((r) => r.data),
};

// ── Payments ──────────────────────────────────────────────────────────────────
export const paymentsAPI = {
  createIntent: (data) => api.post('/api/payments/create-intent', data).then((r) => r.data),
  confirm: (paymentId) => api.post(`/api/payments/confirm/${paymentId}`).then((r) => r.data),
  list: () => api.get('/api/payments').then((r) => r.data),
  getById: (id) => api.get(`/api/payments/${id}`).then((r) => r.data),
  refund: (id) => api.post(`/api/payments/refund/${id}`).then((r) => r.data),
  updateStatus: (id, status) => api.patch(`/api/payments/${id}/status`, { status }).then((r) => r.data),
};

// ── Medical Records ───────────────────────────────────────────────────────────
export const recordsAPI = {
  upload: async (formData) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/records/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Upload failed');
    }
    return res.json();
  },
  list: (params) => api.get('/api/records', { params }).then((r) => r.data),
  getById: (id) => api.get(`/api/records/${id}`).then((r) => r.data),
  update: (id, data) => api.patch(`/api/records/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/api/records/${id}`).then((r) => r.data),
};

// ── Prescriptions ─────────────────────────────────────────────────────────────
export const prescriptionsAPI = {
  create: (data) => api.post('/api/prescriptions', data).then((r) => r.data),
  list: () => api.get('/api/prescriptions').then((r) => r.data),
  getById: (id) => api.get(`/api/prescriptions/${id}`).then((r) => r.data),
  update: (id, data) => api.patch(`/api/prescriptions/${id}`, data).then((r) => r.data),
  delete: (id) => api.delete(`/api/prescriptions/${id}`).then((r) => r.data),
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const notificationsAPI = {
  list: (unreadOnly = false) =>
    api.get('/api/notifications', { params: { unreadOnly } }).then((r) => r.data),
  markRead: (id) => api.patch(`/api/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch('/api/notifications/read-all').then((r) => r.data),
};

// ── Symptoms ──────────────────────────────────────────────────────────────────
export const symptomsAPI = {
  check: (symptoms, additionalContext) => api.post('/api/symptoms/check', { symptoms, additionalContext }).then((r) => r.data),
  history: () => api.get('/api/symptoms/history').then((r) => r.data),
  specialties: () => api.get('/api/symptoms/specialties').then((r) => r.data),
};

export default api;
