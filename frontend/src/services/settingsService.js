import api, { USE_MOCK, getMock } from './api';

export const settingsService = {
  /** Public subset: contact details, delivery fee, announcement. */
  async getPublic() {
    if (USE_MOCK) return (await getMock()).getPublicSettings();
    return api.get('/settings');
  },

  /* -------- Admin -------- */
  async get() {
    if (USE_MOCK) return (await getMock()).getSettings();
    return api.get('/admin/settings');
  },

  async update(payload) {
    if (USE_MOCK) return (await getMock()).updateSettings(payload);
    return api.put('/admin/settings', payload);
  },

  /** Which email provider the API uses and whether it accepts the login (admin only). */
  async mailStatus() {
    if (USE_MOCK) return { data: { ok: true, provider: 'console', detail: 'mock mode: emails are not sent' } };
    return api.get('/admin/settings/mail-status');
  },

  /** Send a test email to the signed-in admin (admin only). */
  async sendTestEmail() {
    if (USE_MOCK) return { data: { message: 'Mock mode: no email is sent.' } };
    return api.post('/admin/settings/test-email');
  },
};

export default settingsService;
