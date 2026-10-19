import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Hide the floating Next.js dev badge.
  devIndicators: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dummyjson.com" },
      { protocol: "https", hostname: "fakestoreapi.com" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
