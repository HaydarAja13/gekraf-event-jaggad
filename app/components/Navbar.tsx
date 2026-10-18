"use client";

import { useEffect, useState } from "react";
import type { Site } from "@/lib/types";
import { CmsImage } from "./CmsImage";

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <div className="relative flex h-4 w-5 flex-col justify-between" aria-hidden>
      <span
        className={`h-0.5 w-full rounded-full bg-gekraf-ink transition-all duration-300 origin-left ${
          open ? "translate-x-0.5 rotate-45" : ""
        }`}
      />
      <span
        className={`h-0.5 w-full rounded-full bg-gekraf-ink transition-all duration-200 ${
          open ? "opacity-0 scale-x-0" : ""
        }`}
      />
      <span
        className={`h-0.5 w-full rounded-full bg-gekraf-ink transition-all duration-300 origin-left ${
          open ? "translate-x-0.5 -rotate-45" : ""
        }`}
      />
    </div>
  );
}

function Logo({ content, href }: { content: Site["navbar"]; href: string }) {
  return (
    <a href={href} className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-2.5">
      <CmsImage
        src={content.logoSrc || "/logo.png"}
        alt={content.logoAlt}
        width={3375}
        height={4219}
        className="h-[58px] w-auto object-contain sm:h-[72px] lg:h-[82px]"
        priority
      />
      <span className="text-[14px] font-bold tracking-[0.03em] text-gekraf-ink uppercase sm:text-[16px] lg:text-[18px]">
        {content.brand}
      </span>
    </a>
  );
}

export default function Navbar({
  content,
  links: showLinks = true,
}: {
  content: Site["navbar"];
  links?: boolean;
}) {
  const links = content.links;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("");
  const ctaHref =
    showLinks || !content.ctaHref.startsWith("#") ? content.ctaHref : `/${content.ctaHref}`;

  useEffect(() => {
    if (!showLinks) return;
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
  }, [links, showLinks]);

  // Handle escape key and lock scroll when mobile menu is open
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  const linkClass = (href: string) =>
    `text-[17px] lg:text-[18px] font-medium transition-colors hover:text-gekraf-cyan ${
      active === href ? "text-gekraf-cyan font-bold" : "text-gekraf-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 overflow-visible border-b border-black/8 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[64px] sm:h-[68px] lg:h-[72px] w-[95%] items-center justify-between gap-3 overflow-visible px-4 sm:px-8 lg:px-12">
        <Logo content={content} href={showLinks ? "#" : "/"} />

        {showLinks ? (
          <nav className="hidden items-center gap-7 xl:gap-8 lg:flex" aria-label="Utama">
            {links.map((l) => (
              <a key={l.href} href={l.href} className={linkClass(l.href)}>
                {l.label}
              </a>
            ))}
          </nav>
        ) : null}

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Tablet & Desktop CTA button */}
          <a
            href={ctaHref}
            className="hidden items-center gap-1.5 rounded-full bg-gekraf-gold px-4 py-2 text-[15px] font-extrabold text-gekraf-ink shadow-[0_4px_16px_rgba(242,203,25,0.24)] transition hover:bg-gekraf-gold-bright sm:inline-flex lg:px-5 lg:py-2.5 lg:text-[18px]"
          >
            {content.ctaLabel}
            <span aria-hidden>→</span>
          </a>

          {showLinks ? (
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-black/10 bg-white text-gekraf-ink transition-colors hover:bg-gekraf-surface active:scale-95 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? "Tutup menu navigasi" : "Buka menu navigasi"}
              onClick={() => setOpen((v) => !v)}
            >
              <HamburgerIcon open={open} />
            </button>
          ) : null}
        </div>
      </div>

      {showLinks && open && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-[64px] sm:top-[68px] z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          {/* Drawer menu */}
          <div
            id="mobile-nav"
            className="fixed inset-x-0 top-[64px] sm:top-[68px] z-50 max-h-[calc(100vh-70px)] overflow-y-auto border-b border-black/10 bg-white shadow-2xl transition-all duration-300 lg:hidden"
          >
            <nav
              className="mx-auto flex w-[95%] max-w-lg flex-col gap-1.5 px-4 py-6 sm:px-8"
              aria-label="Navigasi Mobile dan Tablet"
            >
              {links.map((l) => {
                const isActive = active === l.href;
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    className={`flex min-h-[48px] items-center justify-between rounded-xl px-4 py-3 text-[17px] font-bold transition-all ${
                      isActive
                        ? "bg-gekraf-cyan/10 text-gekraf-cyan font-extrabold"
                        : "text-gekraf-ink hover:bg-gekraf-surface hover:text-gekraf-cyan"
                    }`}
                    onClick={() => setOpen(false)}
                  >
                    <span>{l.label}</span>
                    <span
                      aria-hidden
                      className={`text-sm ${
                        isActive ? "text-gekraf-cyan" : "text-black/30"
                      }`}
                    >
                      →
                    </span>
                  </a>
                );
              })}

              <div className="mt-4 flex flex-col gap-3 border-t border-black/10 pt-4">
                <a
                  href={ctaHref}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gekraf-gold text-[17px] font-extrabold text-gekraf-ink shadow-[0_4px_16px_rgba(242,203,25,0.3)] transition hover:bg-gekraf-gold-bright active:scale-[0.99]"
                  onClick={() => setOpen(false)}
                >
                  {content.ctaLabel}
                  <span aria-hidden>→</span>
                </a>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
