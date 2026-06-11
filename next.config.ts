import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/photo-**",
      },
      {
        protocol: "https",
        hostname: "dynamic-media-cdn.tripadvisor.com",
        pathname: "/media/photo-o/**",
      },
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
        pathname: "/logo-dark.png",
      }
    ],
  },
};

export default nextConfig;
