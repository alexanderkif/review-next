import Link from 'next/link';
import { Settings } from 'lucide-react';
import { auth } from '@/lib/auth';

export default async function AdminLink() {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    return null;
  }

  return (
    <Link href="/admin" className="btn btn-secondary" aria-label="Admin panel">
      <Settings size={16} aria-hidden="true" />
      <span className="hidden md:inline">Admin</span>
    </Link>
  );
}
