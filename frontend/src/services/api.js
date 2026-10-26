import axios from 'axios';
import { getItem, removeItem } from '@/utils/storage';

export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';
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

api.interceptors.response.use(
  (res) => res.data,
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
