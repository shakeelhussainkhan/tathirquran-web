import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Google Fonts to load in Artifacts / previews
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
