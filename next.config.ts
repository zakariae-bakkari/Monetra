import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Any other options you already had—e.g. reactStrictMode, swcMinify,
   * etc—should stay here alongside rewrites
   */
  async rewrites() {
    return [
      {
        source: "/appwrite/:path*",
        destination: "https://fra.cloud.appwrite.io/v1:path*",
      }
    ]
  }
};

export default nextConfig;
