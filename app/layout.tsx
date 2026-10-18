import { Suspense } from "react";
import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { MetaGate } from "@/app/meta-gate";
import { ToastViewport } from "@/app/toast";

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

export const metadata: Metadata = {
  title: "Business Skill Mastery",
  description:
    "Build Your Business. Lead Your People. Scale Your Impact. — National Business Growth Class",
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
