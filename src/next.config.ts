
import type {NextConfig} from 'next';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const nextConfig: NextConfig = {
  /* config options here */
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
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Add the following to fix the cross-origin request error in dev mode
  // This allows the Next.js dev server to accept requests from the Firebase Studio environment
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      allowedDevOrigins: [
        'https://*.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev',
      ],
    },
  }),
};

export default nextConfig;
