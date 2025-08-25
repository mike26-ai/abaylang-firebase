/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
        pathname: "/**",
      }
    ],
  },
  experimental: {
    // This is necessary for Firebase Studio to work correctly in dev mode.
    allowedDevOrigins: [
      "https://*.cluster-ombtxv25tbd6yrjpp3lukp6zhc.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
