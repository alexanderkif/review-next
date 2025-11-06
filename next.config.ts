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
    // Exclude legacy polyfills
    optimizePackageImports: ['lucide-react', 'recharts', 'next-auth', 'react-dom'],
  },
};

export default nextConfig;
