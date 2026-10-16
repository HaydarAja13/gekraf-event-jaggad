"use client";

import { useState } from "react";
import { CtaButton } from "@/components/cta-button";
import { Logo } from "@/components/logo";

const links = [
  { href: "#tentang", label: "Tentang" },
  { href: "#pemateri", label: "Pemateri" },
  { href: "#kurikulum", label: "Kurikulum" },
  { href: "#fasilitas", label: "Fasilitas" },
  { href: "#testimoni", label: "Testimoni" },
  { href: "#harga", label: "Harga" },
];

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-40">
      <div className="mx-auto flex h-[72px] w-full max-w-[1474px] items-center justify-between px-5 sm:h-20 sm:px-8 lg:px-16 xl:px-[126px]">
        <Logo />

        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 lg:flex xl:gap-[34px]" aria-label="Utama">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] font-medium text-white transition-colors hover:text-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CtaButton size="nav" />
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Tutup menu" : "Buka menu"}</span>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="menu-mobile" className="border-t border-white/10 px-5 py-3 sm:px-8 lg:hidden" aria-label="Menu mobile">
          <ul className="flex flex-col">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="flex min-h-11 items-center text-[16px] font-medium text-white transition-colors hover:text-gold"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <CtaButton size="hero" className="mt-3 md:hidden" />
        </nav>
      ) : null}
    </header>
  );
}
