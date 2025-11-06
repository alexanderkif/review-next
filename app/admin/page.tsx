'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import AdminAuthCheck from './components/AdminAuthCheck';

// Динамический импорт тяжелого AdminDashboard
const AdminDashboard = dynamic(() => import('./components/AdminDashboard'), {
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
  ssr: false
});

export default function AdminPage() {
  const { data: session } = useSession();

  return (
    <AdminAuthCheck>
      <AdminDashboard user={session?.user || null} />
    </AdminAuthCheck>
  );
}