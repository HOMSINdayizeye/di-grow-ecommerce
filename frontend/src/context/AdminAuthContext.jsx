import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { adminAuthService } from '@/services/adminAuthService';
import { ROLES } from '@/constants/roles';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from a stored token.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = adminAuthService.getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await adminAuthService.me();
        if (!cancelled) setUser(res.data);
      } catch {
        adminAuthService.clearToken();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await adminAuthService.login(credentials);
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    await adminAuthService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === ROLES.ADMIN,
      hasRole: (...roles) => !!user && roles.includes(user.role),
      login,
      logout,
      setUser,
    }),
    [user, loading, login, logout]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}

export default AdminAuthContext;
