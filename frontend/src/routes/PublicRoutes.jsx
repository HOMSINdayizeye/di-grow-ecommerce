import { lazy } from 'react';
import { Route } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';

const HomePage = lazy(() => import('@/pages/public/HomePage'));
const ShopPage = lazy(() => import('@/pages/public/ShopPage'));
const ProductDetailsPage = lazy(() => import('@/pages/public/ProductDetailsPage'));
const CategoryPage = lazy(() => import('@/pages/public/CategoryPage'));
const SearchPage = lazy(() => import('@/pages/public/SearchPage'));
const CartPage = lazy(() => import('@/pages/public/CartPage'));
const OrderRequestPage = lazy(() => import('@/pages/public/OrderRequestPage'));
const OrderConfirmationPage = lazy(() => import('@/pages/public/OrderConfirmationPage'));
const TrackOrderPage = lazy(() => import('@/pages/public/TrackOrderPage'));
const HowItWorksPage = lazy(() => import('@/pages/public/HowItWorksPage'));
const BlogPage = lazy(() => import('@/pages/public/BlogPage'));
const BlogDetailsPage = lazy(() => import('@/pages/public/BlogDetailsPage'));
const AboutPage = lazy(() => import('@/pages/public/AboutPage'));
const ContactPage = lazy(() => import('@/pages/public/ContactPage'));
const FAQPage = lazy(() => import('@/pages/public/FAQPage'));
const PrivacyPolicyPage = lazy(() => import('@/pages/public/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('@/pages/public/TermsPage'));
const NotFoundPage = lazy(() => import('@/pages/public/NotFoundPage'));

/** Returns the public <Route> tree. Rendered inside <Routes> by AppRoutes. */
export default function PublicRoutes() {
  return (
    <Route element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="shop" element={<ShopPage />} />
      <Route path="product/:slug" element={<ProductDetailsPage />} />
      <Route path="category/:slug" element={<CategoryPage />} />
      <Route path="search" element={<SearchPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="order-request" element={<OrderRequestPage />} />
      <Route path="order-confirmation/:token" element={<OrderConfirmationPage />} />
      <Route path="track-order" element={<TrackOrderPage />} />
      <Route path="how-it-works" element={<HowItWorksPage />} />
      <Route path="blog" element={<BlogPage />} />
      <Route path="blog/:slug" element={<BlogDetailsPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="faq" element={<FAQPage />} />
      <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="terms" element={<TermsPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  );
}
