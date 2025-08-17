import type {NextConfig} from 'next';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Changed for production
  },
  eslint: {
    ignoreDuringBuilds: false, // Changed for production
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack(config, { isServer }) {
    // Grab the existing rule that handles images
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Re-add the existing rule, but modify it to ignore SVGs
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports to React components
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not ?? []), /url/] }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );

    // Modify the original rule to ignore SVGs
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
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
