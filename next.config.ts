import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

const nextConfig: NextConfig = {
  // Static export for deployment; disabled in dev so rewrites (API proxy) work locally
  output: isDev ? undefined : "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  async rewrites() {
    if (!isDev) return [];
    const apiBase = process.env.NEXT_PUBLIC_LOCAL_API ?? "http://localhost:8100";
    return [
      {
        source: "/api/:path*",
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
