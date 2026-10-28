import { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/components/layout/AdminLayout';
import AdminProtectedRoute from './AdminProtectedRoute';
import { ROLES } from '@/constants/roles';

const LoginPage = lazy(() => import('@/pages/admin/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/admin/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/admin/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/admin/DashboardPage'));
const OrdersPage = lazy(() => import('@/pages/admin/OrdersPage'));
const OrderDetailsPage = lazy(() => import('@/pages/admin/OrderDetailsPage'));
const ProductsPage = lazy(() => import('@/pages/admin/ProductsPage'));
const ProductFormPage = lazy(() => import('@/pages/admin/ProductFormPage'));
const CatalogImportsPage = lazy(() => import('@/pages/admin/CatalogImportsPage'));
const CatalogImportReviewPage = lazy(() => import('@/pages/admin/CatalogImportReviewPage'));
const CategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'));
const AdminBlogPage = lazy(() => import('@/pages/admin/BlogPage'));
const BlogFormPage = lazy(() => import('@/pages/admin/BlogFormPage'));
const ReportsPage = lazy(() => import('@/pages/admin/ReportsPage'));
const StaffPage = lazy(() => import('@/pages/admin/StaffPage'));
const SettingsPage = lazy(() => import('@/pages/admin/SettingsPage'));

/** Returns the admin <Route> tree under /admin. */
export default function AdminRoutes() {
  return (
    <Route path="admin">
      <Route path="login" element={<LoginPage />} />
      <Route path="forgot-password" element={<ForgotPasswordPage />} />
      <Route path="reset-password/:token" element={<ResetPasswordPage />} />

      <Route element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:id" element={<OrderDetailsPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/import" element={<CatalogImportsPage />} />
          <Route path="products/import/:id" element={<CatalogImportReviewPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="blog" element={<AdminBlogPage />} />
          <Route path="blog/new" element={<BlogFormPage />} />
          <Route path="blog/:id/edit" element={<BlogFormPage />} />

          <Route element={<AdminProtectedRoute roles={[ROLES.ADMIN]} />}>
            <Route path="reports" element={<ReportsPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Route>
    </Route>
  );
}
