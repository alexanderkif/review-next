'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navigation from './ui/Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    // Check if we're on a 404 page by looking for the 404 marker in the document
    const check404 = () => {
      const is404Page = document.querySelector('[data-is-404]') !== null;
      setIs404(is404Page);
    };

    check404();
    // Recheck on pathname change
    const timer = setTimeout(check404, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Don't show main navigation in admin panel, auth pages, or 404 page
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || is404) {
    return null;
  }

  return <Navigation />;
}
