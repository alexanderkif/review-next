'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export default function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Ждем загрузки сессии
    
    if (status === 'unauthenticated' || !session?.user) {
      router.push('/admin/login');
      return;
    }

    if (session.user.role !== 'admin') {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}