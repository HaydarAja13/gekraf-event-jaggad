"use client";

import { useEffect, useState } from "react";
import type { Site } from "@/lib/types";
import { CmsImage } from "./CmsImage";

function Logo({ content }: { content: Site["navbar"] }) {
  return (
    <a href="#" className="relative z-10 flex shrink-0 items-center gap-2.5">
      <CmsImage
        src={content.logoSrc || "/logo.png"}
        alt={content.logoAlt}
        width={3375}
        height={4219}
        className="h-[76px] w-auto object-contain sm:h-[84px]"
        priority
      />
      <span className="text-[18px] font-bold tracking-[0.08em] text-gekraf-ink uppercase">
        {content.brand}
      </span>
    </a>
  );
}

export default function Navbar({ content }: { content: Site["navbar"] }) {
  const links = content.links;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 96;
      let current = "";
      for (const l of links) {
        const el = document.getElementById(l.href.slice(1));
        if (el && el.offsetTop <= y) current = l.href;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [links]);

  const linkClass = (href: string) =>
    `text-[18px] font-medium transition-colors hover:text-gekraf-cyan ${
      active === href ? "text-gekraf-cyan" : "text-gekraf-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b border-black/10 bg-white">

      {/* tinggi bar tetap — logo boleh lebih tinggi dari bar */}
      <div className="mx-auto flex h-[68px] w-[95%] items-center justify-between gap-4 overflow-visible px-6 sm:px-10 lg:h-[72px] lg:px-12">
        <Logo content={content} />

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Utama">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={linkClass(l.href)}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <a
          href={content.ctaHref}
          className="hidden items-center gap-1.5 rounded-full bg-gekraf-gold px-5 py-2.5 text-[18px] font-extrabold text-gekraf-ink transition hover:bg-gekraf-gold-bright lg:inline-flex"
        >
          {content.ctaLabel}
          <span aria-hidden>→</span>
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-gekraf-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            {open ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div
          id="mobile-nav"
          className="border-t border-black/10 bg-white py-4 lg:hidden"
        >
          <nav
            className="mx-auto flex w-[95%] flex-col gap-3 px-6 sm:px-10 lg:px-12"
            aria-label="Mobile"
          >
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={linkClass(l.href)}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a
              href={content.ctaHref}
              className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-full bg-gekraf-gold px-5 py-3 text-[18px] font-extrabold text-gekraf-ink"
              onClick={() => setOpen(false)}
            >
              {content.ctaLabel} →
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
