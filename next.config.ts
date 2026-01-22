import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'qsdqtqeeoylklsrnrehz.supabase.co',  
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', 
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: 'https://ministay-be-production.up.railway.app/auth/:path*', 
      },
      {
        source: '/api/:path*', 
        destination: 'https://ministay-be-production.up.railway.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;