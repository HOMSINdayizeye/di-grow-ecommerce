import api, { USE_MOCK, getMock, toQuery } from './api';

export const productService = {
  /** Public: paginated product list with filters. */
  async list(params = {}) {
    if (USE_MOCK) return (await getMock()).getProducts(params);
    return api.get('/products', { params: toQuery(params) });
  },

  /** Public: single product by slug, includes related products. */
  async getBySlug(slug) {
    if (USE_MOCK) return (await getMock()).getProduct(slug);
    return api.get(`/products/${slug}`);
  },

  async featured(limit = 8) {
    if (USE_MOCK) return (await getMock()).getProducts({ featured: true, limit });
    return api.get('/products', { params: { featured: true, limit } });
  },

  async search(q, params = {}) {
    return productService.list({ q, ...params });
  },

  /* -------- Admin -------- */
  async adminList(params = {}) {
    if (USE_MOCK) return (await getMock()).getAdminProducts(params);
    return api.get('/admin/products', { params: toQuery(params) });
  },

  async adminGet(id) {
    if (USE_MOCK) return (await getMock()).getAdminProduct(id);
    return api.get(`/admin/products/${id}`);
  },

  async create(payload) {
    if (USE_MOCK) return (await getMock()).createProduct(payload);
    return api.post('/admin/products', payload);
  },

  async update(id, payload) {
    if (USE_MOCK) return (await getMock()).updateProduct(id, payload);
    return api.put(`/admin/products/${id}`, payload);
  },

  async remove(id) {
    if (USE_MOCK) return (await getMock()).deleteProduct(id);
    return api.delete(`/admin/products/${id}`);
  },

  async uploadImage(file, folder = 'products') {
    if (USE_MOCK) return (await getMock()).uploadImage(file);
    const form = new FormData();
    form.append('image', file);
    form.append('folder', folder);
    return api.post('/admin/uploads', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export default productService;
