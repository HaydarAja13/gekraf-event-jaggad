"use client";

import { useState } from "react";
import type { Site } from "@/lib/types";

function SearchIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0 text-gekraf-gold">
      <circle cx="11" cy="11" r="6.5" stroke="#F2CB19" strokeWidth="2.2" />
      <path
        d="M16.5 16.5L21 21"
        stroke="#F2CB19"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function FAQ({ content }: { content: Site["faq"] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="bg-gekraf-surface">
      <div className="mx-auto w-[95%] px-4 sm:px-8 lg:px-12 grid gap-8 py-16 sm:py-20 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-14 lg:py-24">
        <div>
          <span className="inline-flex rounded-full bg-gekraf-gold px-3.5 py-1 text-[14px] sm:text-[15px] lg:text-[16px] font-extrabold tracking-[0.14em] text-gekraf-ink uppercase">
            {content.badge}
          </span>
          <h2 className="mt-4 sm:mt-5 font-serif text-[clamp(1.95rem,3.5vw,2.625rem)] leading-[1.18] font-extrabold text-gekraf-ink text-balance">
            {content.title}
          </h2>
          <p className="mt-3.5 max-w-[24rem] text-[15px] sm:text-[17px] lg:text-[18px] leading-[1.7] text-[#5F7C97]">
            {content.body}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {content.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={`${item.q}-${i}`}
                className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_2px_12px_rgba(15,23,42,0.03)]"
              >
                <button
                  type="button"
                  className="flex min-h-[52px] w-full items-center gap-3.5 px-4.5 py-3.5 sm:px-5 sm:py-4 text-left transition-colors hover:bg-gekraf-surface/50"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <SearchIcon />
                  <span className="min-w-0 flex-1 text-[16px] sm:text-[18px] font-bold text-gekraf-ink">
                    {item.q}
                  </span>
                  <span
                    className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-gekraf-gold/25 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-gekraf-gold" : ""
                    }`}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 4.5L6 8l3.5-3.5"
                        stroke="#0B0E16"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-[#E2E8F0] px-4.5 py-3.5 sm:px-6 sm:py-4 sm:pl-13 text-gekraf-muted animate-fade-in">
                    <p className="text-[15px] sm:text-[17px] leading-relaxed text-[#5F7C97]">
                      {item.a}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
