import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  experimental: {
    agentFeedback: true,
    // Unggahan gambar lewat Server Actions (editor CMS, pamflet tiket) dibatasi
    // 10MB di sini agar gambar sampai ke validasi aplikasi (maks. 4MB, pesan ramah).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
