<<<<<<< HEAD

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      'https://*.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev',
    ],
  },
};

=======
// This file has been intentionally neutralized.
// The Next.js configuration must be managed solely in the root `next.config.ts` file.
// Duplicate configuration files cause unpredictable build errors.
const nextConfig = {};
>>>>>>> before-product-selection-rewrite
export default nextConfig;
