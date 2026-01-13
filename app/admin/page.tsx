'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import AdminAuthCheck from './components/AdminAuthCheck';

// Динамический импорт тяжелого AdminDashboard
const AdminDashboard = dynamic(() => import('./components/AdminDashboard'), {
  loading: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
    </div>
  ),
  ssr: false,
});

export default function AdminPage() {
  const { data: session } = useSession();

  return (
    <AdminAuthCheck>
      <AdminDashboard user={session?.user || null} />
    </AdminAuthCheck>
  );
}
