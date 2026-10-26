/**
 * Safe localStorage helpers. Every call is wrapped because storage can be
 * unavailable (private mode, blocked site data, SSR).
 */
const PREFIX = 'dg:';

export function getItem(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  try {
    window.localStorage.removeItem(PREFIX + key);
  } catch {
    /* ignore */
  }
}

export const storage = { getItem, setItem, removeItem };
export default storage;
