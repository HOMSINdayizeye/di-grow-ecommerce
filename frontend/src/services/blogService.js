import api, { USE_MOCK, getMock, toQuery } from './api';

export const blogService = {
  async list(params = {}) {
    if (USE_MOCK) return (await getMock()).getPosts(params);
    return api.get('/blog', { params: toQuery(params) });
  },

  async getBySlug(slug) {
    if (USE_MOCK) return (await getMock()).getPost(slug);
    return api.get(`/blog/${slug}`);
  },

  /* -------- Admin -------- */
  async adminList(params = {}) {
    if (USE_MOCK) return (await getMock()).getAdminPosts(params);
    return api.get('/admin/blog', { params: toQuery(params) });
  },

  async adminGet(id) {
    if (USE_MOCK) return (await getMock()).getAdminPost(id);
    return api.get(`/admin/blog/${id}`);
  },

  async create(payload) {
    if (USE_MOCK) return (await getMock()).createPost(payload);
    return api.post('/admin/blog', payload);
  },

  async update(id, payload) {
    if (USE_MOCK) return (await getMock()).updatePost(id, payload);
    return api.put(`/admin/blog/${id}`, payload);
  },

  async remove(id) {
    if (USE_MOCK) return (await getMock()).deletePost(id);
    return api.delete(`/admin/blog/${id}`);
  },
};

export default blogService;
