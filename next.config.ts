import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow external images from OAuth providers
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
  // Remove X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;
