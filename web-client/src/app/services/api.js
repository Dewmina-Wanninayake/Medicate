import axios from 'axios';

// ── Base URLs (configurable via env) ────────────────────────────
const USER_SERVICE_URL       = import.meta.env.VITE_USER_SERVICE_URL       || 'http://localhost:3001/api';
const TRANSACTION_SERVICE_URL = import.meta.env.VITE_TRANSACTION_SERVICE_URL || 'http://localhost:3004/api';
const APPOINTMENT_SERVICE_URL = import.meta.env.VITE_APPOINTMENT_SERVICE_URL || 'http://localhost:5004/api';
const CLINICAL_SERVICE_URL    = import.meta.env.VITE_CLINICAL_SERVICE_URL    || 'http://localhost:5001/api';

// ── Helper to attach auth token ──────────────────────────────────
const authInterceptor = (config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

// ── Helper to auto-refresh on 401 ───────────────────────────────
const makeRefreshInterceptor = (instance) => async (error) => {
  const original = error.config;
  if (error.response?.status === 401 && !original._retry) {
    original._retry = true;
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const res = await axios.post(`${USER_SERVICE_URL}/auth/refresh`, { refreshToken });
      const { accessToken, refreshToken: newRefresh } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefresh);
      original.headers.Authorization = `Bearer ${accessToken}`;
      return instance(original);
    } catch {
      localStorage.clear();
      window.location.href = '/login';
    }
  }
  return Promise.reject(error);
};

// ── user-identity-service client ─────────────────────────────────
const api = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});
api.interceptors.request.use(authInterceptor);
api.interceptors.response.use((r) => r, makeRefreshInterceptor(api));

// ── transaction-notify-service client ────────────────────────────
const transactionApi = axios.create({
  baseURL: TRANSACTION_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});
transactionApi.interceptors.request.use(authInterceptor);
transactionApi.interceptors.response.use((r) => r, makeRefreshInterceptor(transactionApi));

// ── appointment-video-service client ─────────────────────────────
const appointmentApi = axios.create({
  baseURL: APPOINTMENT_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});
appointmentApi.interceptors.request.use(authInterceptor);
appointmentApi.interceptors.response.use((r) => r, makeRefreshInterceptor(appointmentApi));

// ── clinical-medical-service client ──────────────────────────────
const clinicalApi = axios.create({
  baseURL: CLINICAL_SERVICE_URL,
  headers: { 'Content-Type': 'application/json' },
});
clinicalApi.interceptors.request.use(authInterceptor);
clinicalApi.interceptors.response.use((r) => r, makeRefreshInterceptor(clinicalApi));

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
  getProfile:     ()       => api.get('/users/profile'),
  updateProfile:  (data)   => api.put('/users/profile', data),
  changePassword: (data)   => api.put('/users/change-password', data),
  listDoctors:    (params) => api.get('/users/doctors', { params }),
  getDoctorById:  (id)     => api.get(`/users/doctors/${id}`),
};

// ── Admin endpoints ──────────────────────────────────────────────
export const adminAPI = {
  getStats:         ()       => api.get('/admin/stats'),
  listUsers:        (params) => api.get('/admin/users', { params }),
  getUserById:      (id)     => api.get(`/admin/users/${id}`),
  updateUser:       (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser:       (id)     => api.delete(`/admin/users/${id}`),
  toggleUserStatus: (id)     => api.put(`/admin/users/${id}/toggle-status`),
  getPendingDoctors:()       => api.get('/admin/doctors/pending'),
  verifyDoctor:     (id)     => api.put(`/admin/doctors/${id}/verify`),
  rejectDoctor:     (id)     => api.put(`/admin/doctors/${id}/reject`),
};

// ── Payment endpoints (transaction-notify-service) ───────────────
export const paymentAPI = {
  createIntent:    (data)   => transactionApi.post('/payments/stripe/intent', data),
  confirmPayment:  (data)   => transactionApi.post('/payments/stripe/confirm', data),
  refund:          (data)   => transactionApi.post('/payments/stripe/refund', data),
  listMethods:     (params) => transactionApi.get('/payments/stripe/methods', { params }),
  myTransactions:  (params) => transactionApi.get('/payments/my-transactions', { params }),
  listTransactions:(params) => transactionApi.get('/payments/transactions', { params }),
  getTransaction:  (id)     => transactionApi.get(`/payments/transactions/${id}`),
  updateStatus:    (id, data) => transactionApi.put(`/payments/transactions/${id}/status`, data),
};

// ── Notification endpoints (transaction-notify-service) ──────────
export const notificationAPI = {
  send:            (data)   => transactionApi.post('/notifications/send', data),
  list:            (params) => transactionApi.get('/notifications', { params }),
  myNotifications: ()       => transactionApi.get('/notifications/my'),
  getById:         (id)     => transactionApi.get(`/notifications/${id}`),
};

// ── Appointment endpoints (appointment-video-service) ────────────
export const appointmentAPI = {
  book:               (data)   => appointmentApi.post('/appointments/book', data),
  list:               (params) => appointmentApi.get('/appointments', { params }),
  cancel:             (id)     => appointmentApi.delete(`/appointments/${id}`),
  updateStatus:       (data)   => appointmentApi.post('/appointments/status-update', data),
  generateRoom:       (data)   => appointmentApi.post('/consultations/generate-room', data),
  getSessionStatus:   (id)     => appointmentApi.get(`/consultations/status/${id}`),
  sendMessage:        (data)   => appointmentApi.post('/consultations/messages', data),
  getMessages:        (id)     => appointmentApi.get(`/consultations/messages/${id}`),
  updateNotes:        (data)   => appointmentApi.patch('/consultations/update-notes', data),
};

// ── Clinical endpoints (clinical-medical-service) ────────────────
export const clinicalAPI = {
  listDoctors:          (params) => clinicalApi.get('/doctors', { params }),
  getDoctor:            (id)     => clinicalApi.get(`/doctors/${id}`),
  createDoctorProfile:  (data)   => clinicalApi.post('/doctors', data),
  updateDoctorProfile:  (id, data) => clinicalApi.put(`/doctors/${id}`, data),
  updateAvailability:   (id, data) => clinicalApi.put(`/doctors/${id}/availability`, data),
  
  uploadRecord:         (data)   => clinicalApi.post('/records/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getPatientRecords:    (id)     => clinicalApi.get(`/records/patient/${id}`),
  getRecord:            (id)     => clinicalApi.get(`/records/${id}`),
  deleteRecord:         (id)     => clinicalApi.delete(`/records/${id}`),
  
  createPrescription:   (data)   => clinicalApi.post('/prescriptions', data),
  getPatientPrescriptions: (id)  => clinicalApi.get(`/prescriptions/patient/${id}`),
  getDoctorPrescriptions: (id)   => clinicalApi.get(`/prescriptions/doctor/${id}`),
  getPrescription:      (id)     => clinicalApi.get(`/prescriptions/${id}`),
  
  aiSymptomCheck:       (data)   => clinicalApi.post('/ai/symptoms', data),
};

export default api;