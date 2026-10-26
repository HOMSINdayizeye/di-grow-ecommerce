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
};

export default settingsService;
