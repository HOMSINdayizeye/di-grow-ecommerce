import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Loader from '@/components/common/Loader';

/**
 * Guards admin routes. Optionally restrict to roles: <AdminProtectedRoute roles={['admin']} />
 */
export default function AdminProtectedRoute({ roles }) {
  const { isAuthenticated, loading, user } = useAdminAuth();
  const location = useLocation();

  if (loading) return <Loader full label="Checking your session…" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/admin" replace />;
  return <Outlet />;
}
