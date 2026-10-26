import api, { USE_MOCK, getMock } from './api';

export const notificationService = {
  async list() {
    if (USE_MOCK) return (await getMock()).getNotifications();
    return api.get('/admin/notifications');
  },

  async markRead(id) {
    if (USE_MOCK) return (await getMock()).markNotificationRead(id);
    return api.patch(`/admin/notifications/${id}/read`);
  },

  async markAllRead() {
    if (USE_MOCK) return (await getMock()).markAllNotificationsRead();
    return api.post('/admin/notifications/read-all');
  },
};

export default notificationService;
