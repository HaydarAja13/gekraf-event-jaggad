import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Landing page adalah satu-satunya halaman yang boleh diindeks; halaman
 *  checkout, tiket, dan dashboard sengaja tidak dimasukkan. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
