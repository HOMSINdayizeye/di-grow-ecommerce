import axios from 'axios';
import { getItem, removeItem } from '@/utils/storage';

/**
 * Demo mode: in-browser mock data instead of the API. Only when VITE_USE_MOCK is explicitly "true",
 * so a deployment that forgets the variable talks to the real API instead of silently showing demo data.
 */
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'false').trim().toLowerCase() === 'true';
export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const ADMIN_TOKEN_KEY = 'admin:token';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getItem(ADMIN_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Uploaded pictures may come back as "/api/uploads/..." (relative to the API). When the API lives
 * on another host than this site, complete them with that host so <img> tags can load them.
 */
const API_ORIGIN = /^https?:\/\//i.test(API_URL) ? new URL(API_URL).origin : '';
const UPLOAD_PATH_RE = /^\/api\/uploads\//i;
function absolutizeUploads(value) {
  if (!API_ORIGIN || value == null) return value;
  if (typeof value === 'string') return UPLOAD_PATH_RE.test(value) ? API_ORIGIN + value : value;
  if (Array.isArray(value)) return value.map(absolutizeUploads);
  if (typeof value === 'object') {
    for (const key of Object.keys(value)) value[key] = absolutizeUploads(value[key]);
  }
  return value;
}

api.interceptors.response.use(
  (res) => absolutizeUploads(res.data),
  (error) => {
    const status = error.response?.status;
    if (status === 401 && window.location.pathname.startsWith('/admin')) {
      removeItem(ADMIN_TOKEN_KEY);
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.assign('/admin/login');
      }
    }
    return Promise.reject(error);
  }
);

/** Extract a friendly message from an axios / mock error. */
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (error?.code === 'ECONNABORTED' ? 'The request timed out. Check your connection.' : null) ||
    (error?.message && !/network error/i.test(error.message) ? error.message : null) ||
    fallback
  );
}

/**
 * Lazily import the mock API only when enabled so it never ships in a real build.
 */
let mockPromise;
export function getMock() {
  if (!mockPromise) mockPromise = import('@/mocks/mockApi').then((m) => m.mockApi);
  return mockPromise;
}

/** Build a query string, skipping empty values. */
export function toQuery(params = {}) {
  const out = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '' || v === false) return;
    out[k] = v;
  });
  return out;
}

export default api;
