import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Verse-card rendering (app/api/verse-card) uses native/wasm packages
  // that must be loaded from node_modules at runtime, not bundled.
  serverExternalPackages: ["@resvg/resvg-js", "satori"],
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
