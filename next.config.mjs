/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false, // keep build failing on TS errors
  },
  eslint: {
    ignoreDuringBuilds: false, // keep build failing on ESLint errors
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
      },
    ],
  },
  // removed invalid experimental.allowedDevOrigins
};

export default nextConfig;
