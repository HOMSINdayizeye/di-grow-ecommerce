import api, { USE_MOCK, getMock, ADMIN_TOKEN_KEY } from './api';
import { getItem, setItem, removeItem } from '@/utils/storage';

export const adminAuthService = {
  getToken() {
    return getItem(ADMIN_TOKEN_KEY);
  },

  setToken(token) {
    setItem(ADMIN_TOKEN_KEY, token);
  },

  clearToken() {
    removeItem(ADMIN_TOKEN_KEY);
  },

  async login(credentials) {
    const res = USE_MOCK ? await (await getMock()).login(credentials) : await api.post('/admin/auth/login', credentials);
    if (res?.data?.token) adminAuthService.setToken(res.data.token);
    return res;
  },

  async me() {
    if (USE_MOCK) return (await getMock()).me(adminAuthService.getToken());
    return api.get('/admin/auth/me');
  },

  async logout() {
    try {
      if (!USE_MOCK) await api.post('/admin/auth/logout');
    } finally {
      adminAuthService.clearToken();
    }
  },

  async forgotPassword(email) {
    if (USE_MOCK) return (await getMock()).forgotPassword({ email });
    return api.post('/admin/auth/forgot-password', { email });
  },

  /** Check the emailed 5-digit code before showing the password fields. The code stays valid. */
  async verifyResetCode({ email, code }) {
    if (USE_MOCK) return (await getMock()).verifyResetCode({ email, code });
    return api.post('/admin/auth/verify-reset-code', { email, code });
  },

  /** Set a new password with the 5-digit code that was emailed to that address. */
  async resetPassword({ email, code, password }) {
    if (USE_MOCK) return (await getMock()).resetPassword({ email, code, password });
    return api.post('/admin/auth/reset-password', { email, code, password });
  },

  async changePassword(currentPassword, newPassword) {
    if (USE_MOCK) return (await getMock()).changePassword({ currentPassword, newPassword });
    return api.post('/admin/auth/change-password', { currentPassword, newPassword });
  },

  /* -------- Staff management (admin role) -------- */
  async listStaff() {
    if (USE_MOCK) return (await getMock()).getStaff();
    return api.get('/admin/staff');
  },

  async createStaff(payload) {
    if (USE_MOCK) return (await getMock()).createStaff(payload);
    return api.post('/admin/staff', payload);
  },

  async updateStaff(id, payload) {
    if (USE_MOCK) return (await getMock()).updateStaff(id, payload);
    return api.put(`/admin/staff/${id}`, payload);
  },

  async removeStaff(id) {
    if (USE_MOCK) return (await getMock()).deleteStaff(id);
    return api.delete(`/admin/staff/${id}`);
  },
};

export default adminAuthService;
