import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Business Skill Mastery",
    short_name: "BS Mastery",
    description:
      "Build Your Business. Lead Your People. Scale Your Impact. — National Business Growth Class, 21 November 2026, Gets Hotel Semarang.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0299c3",
    lang: "id",
    categories: ["business", "education"],
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
