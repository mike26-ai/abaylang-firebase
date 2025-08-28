
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
  // This experimental block is necessary for Firebase Studio to work correctly.
  experimental: {
    allowedDevOrigins: [
      'https://*.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev',
    ],
  },
};

export default nextConfig;
