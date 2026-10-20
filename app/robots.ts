import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Hanya halaman publik yang boleh dirayapi. Halaman pribadi (dashboard,
 *  login, tiket per pembeli) diblokir; /checkout justru dibiarkan terbaca
 *  karena penanda noindex-nya harus dilihat Google. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/login", "/tiket/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
