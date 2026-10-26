import { Suspense } from 'react';
import { Routes } from 'react-router-dom';
import PublicRoutes from './PublicRoutes';
import AdminRoutes from './AdminRoutes';
import Loader from '@/components/common/Loader';

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loader full />}>
      <Routes>
        {PublicRoutes()}
        {AdminRoutes()}
      </Routes>
    </Suspense>
  );
}
