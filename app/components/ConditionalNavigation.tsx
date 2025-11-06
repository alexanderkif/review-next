'use client';

import { usePathname } from 'next/navigation';
import Navigation from './ui/Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  
  // Don't show main navigation in admin panel
  if (pathname.startsWith('/admin')) {
    return null;
  }
  
  return <Navigation />;
}