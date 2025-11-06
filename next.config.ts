import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Images are now stored in database as base64, no external sources needed
  images: {
    remotePatterns: [],
  },
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Target modern browsers to avoid unnecessary polyfills
  experimental: {
    // Optimize package imports for better tree-shaking
    optimizePackageImports: ['lucide-react', 'recharts', 'next-auth', 'react-dom'],
  },
  // Disable source maps in production to reduce bundle size
  productionBrowserSourceMaps: false,
};

export default nextConfig;
