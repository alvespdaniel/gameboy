import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/gameboy",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
