'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ClientThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    // Determine theme based on pathname
    const isGlassTheme =
      pathname.startsWith('/projects') ||
      pathname.startsWith('/auth') ||
      pathname.startsWith('/not-found');

    const theme = isGlassTheme ? 'theme-glass' : 'theme-clay';

    // Update body class
    document.body.className = document.body.className
      .split(' ')
      .filter((cls) => !cls.startsWith('theme-'))
      .concat(theme)
      .join(' ');
  }, [pathname]);

  return null;
}
