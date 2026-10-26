import api, { USE_MOCK, getMock } from './api';

export const categoryService = {
  async list() {
    if (USE_MOCK) return (await getMock()).getCategories();
    return api.get('/categories');
  },

  async getBySlug(slug) {
    if (USE_MOCK) return (await getMock()).getCategory(slug);
    return api.get(`/categories/${slug}`);
  },

  /* -------- Admin -------- */
  async adminList() {
    if (USE_MOCK) return (await getMock()).getAdminCategories();
    return api.get('/admin/categories');
  },

  async create(payload) {
    if (USE_MOCK) return (await getMock()).createCategory(payload);
    return api.post('/admin/categories', payload);
  },

  async update(id, payload) {
    if (USE_MOCK) return (await getMock()).updateCategory(id, payload);
    return api.put(`/admin/categories/${id}`, payload);
  },

  async remove(id) {
    if (USE_MOCK) return (await getMock()).deleteCategory(id);
    return api.delete(`/admin/categories/${id}`);
  },
};

export default categoryService;
