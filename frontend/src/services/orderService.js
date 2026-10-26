import api, { USE_MOCK, getMock, toQuery } from './api';

export const orderService = {
  /* -------- Public -------- */

  /**
   * Create an order request. No payment is taken online; the shop calls the
   * customer to confirm. Payload: { customer: {...}, items: [{ productId, quantity }] }
   */
  async create(payload) {
    if (USE_MOCK) return (await getMock()).createOrder(payload);
    return api.post('/orders', payload);
  },

  /** Track with order number + phone (rate limited on the backend). */
  async track({ orderNumber, phone }) {
    if (USE_MOCK) return (await getMock()).trackOrder({ orderNumber, phone });
    return api.get('/orders/track', { params: { orderNumber, phone } });
  },

  /** Confirmation page lookup by the token returned on creation. */
  async getByToken(token) {
    if (USE_MOCK) return (await getMock()).getOrderByToken(token);
    return api.get(`/orders/confirmation/${token}`);
  },

  /* -------- Admin -------- */
  async adminList(params = {}) {
    if (USE_MOCK) return (await getMock()).getAdminOrders(params);
    return api.get('/admin/orders', { params: toQuery(params) });
  },

  async adminGet(id) {
    if (USE_MOCK) return (await getMock()).getAdminOrder(id);
    return api.get(`/admin/orders/${id}`);
  },

  async updateStatus(id, status, note = '') {
    if (USE_MOCK) return (await getMock()).updateOrderStatus(id, { status, note });
    return api.patch(`/admin/orders/${id}/status`, { status, note });
  },

  async updateNotes(id, adminNotes) {
    if (USE_MOCK) return (await getMock()).updateOrderNotes(id, { adminNotes });
    return api.patch(`/admin/orders/${id}/notes`, { adminNotes });
  },
};

export default orderService;
