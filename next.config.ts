import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  basePath: "/liga",
  assetPrefix: "/liga",
};

export default nextConfig;
