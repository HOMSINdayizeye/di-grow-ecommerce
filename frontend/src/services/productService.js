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

  /* -------- Catalogue PDF imports (admin) -------- */
  /** Upload a catalogue PDF; the API reads pictures and text and answers with the candidates. */
  async importCatalog(file, onProgress) {
    if (USE_MOCK) throw new Error('Catalogue import needs the real API (set VITE_USE_MOCK=false).');
    const form = new FormData();
    form.append('catalog', file);
    return api.post('/admin/products/imports', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 5 * 60 * 1000,
      onUploadProgress: onProgress ? (e) => onProgress(e.total ? Math.round((e.loaded / e.total) * 100) : 0) : undefined,
    });
  },

  async listImports() {
    if (USE_MOCK) return { data: [] };
    return api.get('/admin/products/imports');
  },

  async getImport(id) {
    if (USE_MOCK) throw new Error('Catalogue import needs the real API (set VITE_USE_MOCK=false).');
    return api.get(`/admin/products/imports/${id}`);
  },

  /** Save edits on candidates: [{ _id, name, price, categoryId, ... }]. */
  async updateImportItems(id, items) {
    return api.put(`/admin/products/imports/${id}/items`, { items });
  },

  /** Turn the selected candidates into products. Answers { created[], failed[], import }. */
  async commitImport(id, itemIds, defaults = {}) {
    return api.post(`/admin/products/imports/${id}/commit`, { itemIds, defaults });
  },

  async removeImport(id) {
    return api.delete(`/admin/products/imports/${id}`);
  },
};

export default productService;
