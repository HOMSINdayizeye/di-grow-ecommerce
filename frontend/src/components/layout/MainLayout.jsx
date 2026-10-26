import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import MiniCart from '@/components/cart/MiniCart';
import WhatsAppButton from '@/components/common/WhatsAppButton';
import Loader from '@/components/common/Loader';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import OrganizationSchema from '@/seo/OrganizationSchema';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <OrganizationSchema />
      <Header />
      <main className="flex-1">
        <ErrorBoundary>
          <Suspense fallback={<Loader full />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <MiniCart />
      <WhatsAppButton />
    </div>
  );
}
