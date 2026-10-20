import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { MetaGate } from "@/app/meta-gate";
import { ToastViewport } from "@/app/toast";
import { OG_IMAGE, ORGANIZER, SITE_NAME, SITE_URL } from "@/lib/seo";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const description =
  "Build Your Business. Lead Your People. Scale Your Impact. — National Business Growth Class, 21 November 2026 di Gets Hotel Semarang.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — National Business Growth Class`,
    template: `%s — ${SITE_NAME}`,
  },
  description,
  applicationName: SITE_NAME,
  keywords: [
    "business skill mastery",
    "national business growth class",
    "kelas bisnis Semarang",
    "pelatihan bisnis Semarang",
    "seminar bisnis 2026",
    "kelas kewirausahaan",
    "jaggad academy",
    "gekraf jawa tengah",
  ],
  authors: [{ name: ORGANIZER, url: SITE_URL }],
  creator: "Jaggad Academy",
  publisher: ORGANIZER,
  category: "business",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — National Business Growth Class`,
    description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — National Business Growth Class`,
    description,
    images: [OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "9GZwps45h5wHKvY7IdWbJlW6pkTxvIgViehI7JAkwVQ",
  },
};

export const viewport: Viewport = {
  themeColor: "#0299c3",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Suspense fallback={null}>
          <MetaGate />
        </Suspense>
        <ToastViewport />
      </body>
    </html>
  );
}
