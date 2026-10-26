/**
 * A tiny in-memory API used when VITE_USE_MOCK=true.
 * Every function resolves asynchronously (with a small delay) and returns the
 * same shape the real backend will: { data, meta? }.
 */
import {
  categories as seedCategories,
  products as seedProducts,
  blogPosts as seedPosts,
  orders as seedOrders,
  siteSettings as seedSettings,
  adminUsers as seedUsers,
  notifications as seedNotifications,
  auditLogs as seedAudit,
  MOCK_ADMIN_PASSWORD,
} from './data';
import { getItem, setItem } from '@/utils/storage';

// Persist mutations across reloads so the demo feels real.
const load = (key, seed) => getItem(`mock:${key}`, null) ?? structuredClone(seed);
const state = {
  categories: load('categories', seedCategories),
  products: load('products', seedProducts),
  posts: load('posts', seedPosts),
  orders: load('orders', seedOrders),
  settings: load('settings', seedSettings),
  users: load('users', seedUsers),
  notifications: load('notifications', seedNotifications),
  audit: seedAudit,
};
const persist = (key) => setItem(`mock:${key}`, state[key]);

const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms));
const uid = (p = 'id') => `${p}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const now = () => new Date().toISOString();
const slugify = (s) =>
  String(s)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const fail = (status, message) => {
  const err = new Error(message);
  err.response = { status, data: { success: false, message } };
  return Promise.reject(err);
};

const paginate = (list, { page = 1, limit = 12 } = {}) => {
  const p = Math.max(1, Number(page) || 1);
  const l = Math.max(1, Number(limit) || 12);
  const total = list.length;
  return {
    data: list.slice((p - 1) * l, p * l),
    meta: { page: p, limit: l, total, totalPages: Math.max(1, Math.ceil(total / l)) },
  };
};

const sorters = {
  newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  popular: (a, b) => b.reviewCount - a.reviewCount,
  rating: (a, b) => b.rating - a.rating,
  name: (a, b) => a.name.localeCompare(b.name),
};

/* ----------------------------- Public ----------------------------- */
export const mockApi = {
  async getCategories() {
    await delay(200);
    const list = state.categories
      .filter((c) => c.isActive)
      .map((c) => ({
        ...c,
        productCount: state.products.filter((p) => p.category._id === c._id).length,
      }));
    return { data: list };
  },

  async getCategory(slug) {
    await delay(200);
    const c = state.categories.find((x) => x.slug === slug);
    if (!c) return fail(404, 'Category not found');
    return { data: c };
  },

  async getProducts(params = {}) {
    await delay();
    let list = [...state.products];
    const { q, category, minPrice, maxPrice, inStock, prescription, featured, sort = 'newest' } = params;
    if (q) {
      const s = q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(s) ||
          p.shortDescription.toLowerCase().includes(s) ||
          p.brand.toLowerCase().includes(s) ||
          p.tags.some((t) => t.includes(s)) ||
          p.category.name.toLowerCase().includes(s)
      );
    }
    if (category) {
      const cats = String(category).split(',');
      list = list.filter((p) => cats.includes(p.category.slug));
    }
    if (minPrice) list = list.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) list = list.filter((p) => p.price <= Number(maxPrice));
    if (inStock === 'true' || inStock === true) list = list.filter((p) => p.inStock);
    if (prescription === 'false') list = list.filter((p) => !p.requiresPrescription);
    if (prescription === 'true') list = list.filter((p) => p.requiresPrescription);
    if (featured === 'true' || featured === true) list = list.filter((p) => p.isFeatured);
    list.sort(sorters[sort] || sorters.newest);
    return paginate(list, params);
  },

  async getProduct(slug) {
    await delay(250);
    const p = state.products.find((x) => x.slug === slug || x._id === slug);
    if (!p) return fail(404, 'Product not found');
    const related = state.products
      .filter((x) => x.category._id === p.category._id && x._id !== p._id)
      .slice(0, 4);
    return { data: { ...p, related } };
  },

  async getPosts(params = {}) {
    await delay();
    let list = state.posts.filter((p) => p.isPublished);
    if (params.q) list = list.filter((p) => p.title.toLowerCase().includes(params.q.toLowerCase()));
    if (params.category) list = list.filter((p) => p.category === params.category);
    list.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    return paginate(list, { page: params.page, limit: params.limit || 9 });
  },

  async getPost(slug) {
    await delay(250);
    const p = state.posts.find((x) => x.slug === slug && x.isPublished);
    if (!p) return fail(404, 'Post not found');
    const related = state.posts.filter((x) => x.isPublished && x._id !== p._id).slice(0, 3);
    return { data: { ...p, related } };
  },

  async getPublicSettings() {
    await delay(100);
    const s = state.settings;
    return {
      data: {
        storeName: s.storeName,
        tagline: s.tagline,
        phone: s.phone,
        whatsapp: s.whatsapp,
        email: s.email,
        address: s.address,
        openingHours: s.openingHours,
        deliveryFee: s.deliveryFee,
        freeDeliveryThreshold: s.freeDeliveryThreshold,
        deliveryNote: s.deliveryNote,
        announcement: s.announcementEnabled ? s.announcement : '',
      },
    };
  },

  async createOrder(payload) {
    await delay(700);
    const items = payload.items.map((i) => {
      const p = state.products.find((x) => x._id === i.productId);
      if (!p) throw new Error('Product unavailable');
      return {
        product: p._id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        quantity: i.quantity,
        image: p.images[0],
        requiresPrescription: p.requiresPrescription,
      };
    });
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const deliveryFee = subtotal >= state.settings.freeDeliveryThreshold ? 0 : state.settings.deliveryFee;
    const createdAt = now();
    const ymd = createdAt.slice(0, 10).replace(/-/g, '');
    const seq = String(1000 + state.orders.length + 1);
    const order = {
      _id: uid('o'),
      orderNumber: `DG-${ymd}-${seq}`,
      trackingToken: uid('tok'),
      customer: payload.customer,
      items,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      hasPrescriptionItems: items.some((i) => i.requiresPrescription),
      status: 'new',
      statusHistory: [{ status: 'new', note: 'Order request received', at: createdAt }],
      adminNotes: '',
      createdAt,
      updatedAt: createdAt,
    };
    state.orders.unshift(order);
    persist('orders');
    state.notifications.unshift({
      _id: uid('n'),
      type: 'new_order',
      title: 'New order request',
      message: `${order.orderNumber} from ${order.customer.name} (${items.length} item${items.length > 1 ? 's' : ''})`,
      orderId: order._id,
      isRead: false,
      createdAt,
    });
    persist('notifications');
    window.dispatchEvent(new CustomEvent('mock:new-order', { detail: order }));
    return { data: order };
  },

  async trackOrder({ orderNumber, phone }) {
    await delay(500);
    const norm = (s) => String(s || '').replace(/\D/g, '').slice(-9);
    const o = state.orders.find(
      (x) =>
        x.orderNumber.toLowerCase() === String(orderNumber).trim().toLowerCase() &&
        norm(x.customer.phone) === norm(phone)
    );
    if (!o) return fail(404, 'No order matches that order number and phone number.');
    return { data: o };
  },

  async getOrderByToken(token) {
    await delay(300);
    const o = state.orders.find((x) => x.trackingToken === token);
    if (!o) return fail(404, 'Order not found');
    return { data: o };
  },

  /* ------------------------------ Admin ------------------------------ */
  async login({ email, password }) {
    await delay(600);
    const u = state.users.find((x) => x.email.toLowerCase() === String(email).toLowerCase());
    if (!u || password !== MOCK_ADMIN_PASSWORD) return fail(401, 'Invalid email or password');
    if (!u.isActive) return fail(403, 'This account has been deactivated');
    u.lastLoginAt = now();
    persist('users');
    return { data: { token: `mock-jwt-${u._id}`, user: { _id: u._id, name: u.name, email: u.email, role: u.role } } };
  },

  async me(token) {
    await delay(150);
    const id = String(token || '').replace('mock-jwt-', '');
    const u = state.users.find((x) => x._id === id);
    if (!u) return fail(401, 'Session expired');
    return { data: { _id: u._id, name: u.name, email: u.email, role: u.role } };
  },

  async forgotPassword() {
    await delay(600);
    return { data: { message: 'If that email exists, a reset link has been sent.' } };
  },

  async resetPassword() {
    await delay(600);
    return { data: { message: 'Password updated. You can now sign in.' } };
  },

  async changePassword() {
    await delay(500);
    return { data: { message: 'Password changed.' } };
  },

  async getDashboardStats() {
    await delay(400);
    const orders = state.orders;
    const today = new Date().toDateString();
    const delivered = orders.filter((o) => o.status === 'delivered');
    const revenue = delivered.reduce((s, o) => s + o.total, 0);
    const last14 = [...Array(14)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      const key = d.toDateString();
      const dayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === key);
      return {
        date: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
        orders: dayOrders.length,
        revenue: dayOrders.filter((o) => o.status === 'delivered').reduce((s, o) => s + o.total, 0),
      };
    });
    const byStatus = ['new', 'contacted', 'confirmed', 'delivered', 'cancelled'].map((s) => ({
      status: s,
      count: orders.filter((o) => o.status === s).length,
    }));
    const productSales = {};
    delivered.forEach((o) =>
      o.items.forEach((i) => {
        productSales[i.name] = productSales[i.name] || { name: i.name, qty: 0, revenue: 0 };
        productSales[i.name].qty += i.quantity;
        productSales[i.name].revenue += i.quantity * i.price;
      })
    );
    return {
      data: {
        totals: {
          ordersToday: orders.filter((o) => new Date(o.createdAt).toDateString() === today).length,
          newOrders: orders.filter((o) => o.status === 'new').length,
          totalOrders: orders.length,
          revenue,
          products: state.products.length,
          lowStock: state.products.filter((p) => p.stockQty <= 5).length,
          customers: new Set(orders.map((o) => o.customer.phone)).size,
        },
        series: last14,
        byStatus,
        topProducts: Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5),
        recentOrders: [...orders].sort(sorters.newest).slice(0, 6),
      },
    };
  },

  async getAdminOrders(params = {}) {
    await delay();
    let list = [...state.orders];
    if (params.status) list = list.filter((o) => o.status === params.status);
    if (params.q) {
      const s = params.q.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(s) ||
          o.customer.name.toLowerCase().includes(s) ||
          o.customer.phone.includes(s)
      );
    }
    if (params.from) list = list.filter((o) => new Date(o.createdAt) >= new Date(params.from));
    if (params.to) list = list.filter((o) => new Date(o.createdAt) <= new Date(params.to + 'T23:59:59'));
    list.sort(sorters.newest);
    return paginate(list, { page: params.page, limit: params.limit || 10 });
  },

  async getAdminOrder(id) {
    await delay(250);
    const o = state.orders.find((x) => x._id === id);
    if (!o) return fail(404, 'Order not found');
    return { data: o };
  },

  async updateOrderStatus(id, { status, note }) {
    await delay(400);
    const o = state.orders.find((x) => x._id === id);
    if (!o) return fail(404, 'Order not found');
    o.status = status;
    o.statusHistory.push({ status, note: note || '', at: now() });
    o.updatedAt = now();
    persist('orders');
    return { data: o };
  },

  async updateOrderNotes(id, { adminNotes }) {
    await delay(300);
    const o = state.orders.find((x) => x._id === id);
    if (!o) return fail(404, 'Order not found');
    o.adminNotes = adminNotes;
    o.updatedAt = now();
    persist('orders');
    return { data: o };
  },

  async getAdminProducts(params = {}) {
    await delay();
    let list = [...state.products];
    if (params.q) list = list.filter((p) => p.name.toLowerCase().includes(params.q.toLowerCase()) || p.sku.toLowerCase().includes(params.q.toLowerCase()));
    if (params.category) list = list.filter((p) => p.category.slug === params.category);
    if (params.stock === 'low') list = list.filter((p) => p.stockQty <= 5);
    if (params.stock === 'out') list = list.filter((p) => !p.inStock);
    list.sort(sorters[params.sort] || sorters.newest);
    return paginate(list, { page: params.page, limit: params.limit || 10 });
  },

  async getAdminProduct(id) {
    await delay(250);
    const p = state.products.find((x) => x._id === id);
    if (!p) return fail(404, 'Product not found');
    return { data: p };
  },

  async createProduct(payload) {
    await delay(500);
    const c = state.categories.find((x) => x._id === payload.categoryId);
    if (!c) return fail(400, 'Choose a valid category');
    const p = {
      _id: uid('p'),
      slug: slugify(payload.name),
      rating: 0,
      reviewCount: 0,
      tags: [],
      createdAt: now(),
      updatedAt: now(),
      ...payload,
      category: { _id: c._id, name: c.name, slug: c.slug },
      images: payload.images?.length ? payload.images : [`https://picsum.photos/seed/${slugify(payload.name)}/900/900`],
      inStock: Number(payload.stockQty) > 0,
    };
    delete p.categoryId;
    state.products.unshift(p);
    persist('products');
    return { data: p };
  },

  async updateProduct(id, payload) {
    await delay(500);
    const i = state.products.findIndex((x) => x._id === id);
    if (i < 0) return fail(404, 'Product not found');
    const c = state.categories.find((x) => x._id === (payload.categoryId || state.products[i].category._id));
    const next = {
      ...state.products[i],
      ...payload,
      category: { _id: c._id, name: c.name, slug: c.slug },
      inStock: Number(payload.stockQty ?? state.products[i].stockQty) > 0,
      updatedAt: now(),
    };
    delete next.categoryId;
    state.products[i] = next;
    persist('products');
    return { data: next };
  },

  async deleteProduct(id) {
    await delay(400);
    state.products = state.products.filter((x) => x._id !== id);
    persist('products');
    return { data: { _id: id } };
  },

  async uploadImage(file) {
    await delay(600);
    const url = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
    return { data: { url } };
  },

  async getAdminCategories() {
    await delay(200);
    return {
      data: state.categories.map((c) => ({
        ...c,
        productCount: state.products.filter((p) => p.category._id === c._id).length,
      })),
    };
  },

  async createCategory(payload) {
    await delay(400);
    const c = { _id: uid('c'), slug: slugify(payload.name), isActive: true, productCount: 0, icon: 'Tag', ...payload };
    state.categories.push(c);
    persist('categories');
    return { data: c };
  },

  async updateCategory(id, payload) {
    await delay(400);
    const i = state.categories.findIndex((x) => x._id === id);
    if (i < 0) return fail(404, 'Category not found');
    state.categories[i] = { ...state.categories[i], ...payload };
    state.products.forEach((p) => {
      if (p.category._id === id) p.category = { _id: id, name: state.categories[i].name, slug: state.categories[i].slug };
    });
    persist('categories');
    persist('products');
    return { data: state.categories[i] };
  },

  async deleteCategory(id) {
    await delay(400);
    if (state.products.some((p) => p.category._id === id)) return fail(400, 'Move or delete its products first');
    state.categories = state.categories.filter((x) => x._id !== id);
    persist('categories');
    return { data: { _id: id } };
  },

  async getAdminPosts(params = {}) {
    await delay();
    let list = [...state.posts];
    if (params.q) list = list.filter((p) => p.title.toLowerCase().includes(params.q.toLowerCase()));
    if (params.status === 'published') list = list.filter((p) => p.isPublished);
    if (params.status === 'draft') list = list.filter((p) => !p.isPublished);
    list.sort(sorters.newest);
    return paginate(list, { page: params.page, limit: params.limit || 10 });
  },

  async getAdminPost(id) {
    await delay(250);
    const p = state.posts.find((x) => x._id === id);
    if (!p) return fail(404, 'Post not found');
    return { data: p };
  },

  async createPost(payload) {
    await delay(500);
    const p = {
      _id: uid('b'),
      slug: slugify(payload.title),
      readTime: Math.max(1, Math.round(String(payload.content || '').split(/\s+/).length / 200)),
      createdAt: now(),
      publishedAt: payload.isPublished ? now() : null,
      author: { name: 'Admin User', role: 'Editor' },
      tags: [],
      ...payload,
    };
    state.posts.unshift(p);
    persist('posts');
    return { data: p };
  },

  async updatePost(id, payload) {
    await delay(500);
    const i = state.posts.findIndex((x) => x._id === id);
    if (i < 0) return fail(404, 'Post not found');
    const prev = state.posts[i];
    state.posts[i] = {
      ...prev,
      ...payload,
      publishedAt: payload.isPublished ? prev.publishedAt || now() : null,
    };
    persist('posts');
    return { data: state.posts[i] };
  },

  async deletePost(id) {
    await delay(400);
    state.posts = state.posts.filter((x) => x._id !== id);
    persist('posts');
    return { data: { _id: id } };
  },

  async getNotifications() {
    await delay(200);
    return { data: state.notifications.slice(0, 30), meta: { unread: state.notifications.filter((n) => !n.isRead).length } };
  },

  async markNotificationRead(id) {
    await delay(100);
    const n = state.notifications.find((x) => x._id === id);
    if (n) n.isRead = true;
    persist('notifications');
    return { data: n };
  },

  async markAllNotificationsRead() {
    await delay(150);
    state.notifications.forEach((n) => (n.isRead = true));
    persist('notifications');
    return { data: { ok: true } };
  },

  async getReports({ from, to } = {}) {
    await delay(500);
    let list = [...state.orders];
    if (from) list = list.filter((o) => new Date(o.createdAt) >= new Date(from));
    if (to) list = list.filter((o) => new Date(o.createdAt) <= new Date(to + 'T23:59:59'));
    const delivered = list.filter((o) => o.status === 'delivered');
    const byDay = {};
    list.forEach((o) => {
      const k = o.createdAt.slice(0, 10);
      byDay[k] = byDay[k] || { date: k, orders: 0, revenue: 0 };
      byDay[k].orders += 1;
      if (o.status === 'delivered') byDay[k].revenue += o.total;
    });
    const byCategory = {};
    delivered.forEach((o) =>
      o.items.forEach((i) => {
        const p = state.products.find((x) => x._id === i.product);
        const name = p?.category.name || 'Other';
        byCategory[name] = byCategory[name] || { name, revenue: 0, qty: 0 };
        byCategory[name].revenue += i.price * i.quantity;
        byCategory[name].qty += i.quantity;
      })
    );
    const byDistrict = {};
    list.forEach((o) => {
      const d = o.customer.district || 'Unknown';
      byDistrict[d] = byDistrict[d] || { name: d, orders: 0 };
      byDistrict[d].orders += 1;
    });
    const productSales = {};
    delivered.forEach((o) =>
      o.items.forEach((i) => {
        productSales[i.name] = productSales[i.name] || { name: i.name, qty: 0, revenue: 0 };
        productSales[i.name].qty += i.quantity;
        productSales[i.name].revenue += i.quantity * i.price;
      })
    );
    return {
      data: {
        summary: {
          orders: list.length,
          delivered: delivered.length,
          cancelled: list.filter((o) => o.status === 'cancelled').length,
          revenue: delivered.reduce((s, o) => s + o.total, 0),
          avgOrderValue: delivered.length ? Math.round(delivered.reduce((s, o) => s + o.total, 0) / delivered.length) : 0,
          conversion: list.length ? Math.round((delivered.length / list.length) * 100) : 0,
        },
        byDay: Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date)),
        byCategory: Object.values(byCategory).sort((a, b) => b.revenue - a.revenue),
        byDistrict: Object.values(byDistrict).sort((a, b) => b.orders - a.orders),
        topProducts: Object.values(productSales).sort((a, b) => b.revenue - a.revenue).slice(0, 8),
      },
    };
  },

  async getStaff() {
    await delay(300);
    return { data: state.users };
  },

  async createStaff(payload) {
    await delay(500);
    if (state.users.some((u) => u.email.toLowerCase() === payload.email.toLowerCase())) return fail(400, 'Email already in use');
    const u = { _id: uid('u'), isActive: true, lastLoginAt: null, createdAt: now(), role: 'staff', ...payload };
    delete u.password;
    state.users.push(u);
    persist('users');
    return { data: u };
  },

  async updateStaff(id, payload) {
    await delay(400);
    const i = state.users.findIndex((x) => x._id === id);
    if (i < 0) return fail(404, 'User not found');
    const next = { ...state.users[i], ...payload };
    delete next.password;
    state.users[i] = next;
    persist('users');
    return { data: next };
  },

  async deleteStaff(id) {
    await delay(400);
    state.users = state.users.filter((x) => x._id !== id);
    persist('users');
    return { data: { _id: id } };
  },

  async getSettings() {
    await delay(300);
    return { data: state.settings };
  },

  async updateSettings(payload) {
    await delay(500);
    state.settings = { ...state.settings, ...payload };
    persist('settings');
    return { data: state.settings };
  },

  async getAuditLogs() {
    await delay(300);
    return { data: state.audit };
  },
};

export default mockApi;
