import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Business Skill Mastery | National Business Growth Class",
  description:
    "Satu hari intensif bersama para praktisi dan pemimpin bisnis. Sabtu, 15 Maret 2027 di Smesreneng, Jawa Tengah. Kuota terbatas untuk 200 peserta.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
