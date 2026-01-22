/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
<<<<<<< HEAD
    ignoreBuildErrors: false, // keep build failing on TS errors
  },
  eslint: {
    ignoreDuringBuilds: false, // keep build failing on ESLint errors
=======
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
>>>>>>> before-product-selection-rewrite
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
<<<<<<< HEAD
      },
    ],
  },
  // removed invalid experimental.allowedDevOrigins
=======
      }
    ],
  },
  // experimental: { }, // optional — safe to remove
>>>>>>> before-product-selection-rewrite
};

export default nextConfig;
