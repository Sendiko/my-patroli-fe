import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mypatroli.sendiko.my.id',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
