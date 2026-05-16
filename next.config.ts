import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.29"],

  productionBrowserSourceMaps: false,

  compiler: {
    removeConsole: true,
  },
};

export default nextConfig;