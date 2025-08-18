import type {NextConfig} from 'next';

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
  webpack(config) {
    // Find the existing rule that handles images
    const imageRule = config.module.rules.find(
      (rule) => typeof rule === 'object' && rule.test && rule.test.test('.svg')
    );
    // Exclude SVG from the default image rule
    if (imageRule && typeof imageRule === 'object') {
      imageRule.exclude = /\.svg$/;
    }

    // Add a new rule for SVG files using @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

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
