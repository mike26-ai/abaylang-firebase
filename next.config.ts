
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
<<<<<<< HEAD
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
=======
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
>>>>>>> before-product-selection-rewrite
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
<<<<<<< HEAD
  // This experimental block is necessary for Firebase Studio to work correctly.
  experimental: {
    allowedDevOrigins: [
      'https://*.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev',
    ],
=======
  experimental: {
    
>>>>>>> before-product-selection-rewrite
  },
};

export default nextConfig;
