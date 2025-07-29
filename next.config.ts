import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "https://unsplash.com/", // example domain
        pathname: "/**",
      },
      // Add more domains as needed, e.g.:
      {
        protocol: "https",
        hostname: "https://in.pinterest.com/",
        pathname: "/**",
      },
    ],
  },
  // other config options can go here
};

export default nextConfig;
