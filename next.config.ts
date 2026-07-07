import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.licdn.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  eslint: {
    // Warning-only in production build for faster deployment iteration
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during next build because typescript is verified via custom tsc check in CI
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
