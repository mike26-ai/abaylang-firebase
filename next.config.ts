import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config) {
    // Grab the existing rule that handles SVG imports
    const fileLoaderRule = config.module.rules.find((rule) =>
      typeof rule === 'object' && rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      // Re-add the existing rule, but modify it to ignore SVGs when
      // they are imported from files ending in `.js` or `.ts` (or .jsx, .tsx).
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      // Convert all other *.svg imports into React components
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );

    // Modify the file loader rule to ignore *.svg, since we have a new rule that handles it
    if (fileLoaderRule && typeof fileLoaderRule === 'object') {
        fileLoaderRule.exclude = /\.svg$/i;
    }

    return config;
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
};

export default nextConfig;
