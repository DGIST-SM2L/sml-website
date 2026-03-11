import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Allow all site pages to be embedded in the admin iframe (same origin)
        source: "/((?!admin).*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
