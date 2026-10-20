"use client";

import { useEffect, useRef, useState } from "react";
import type { Site } from "@/lib/types";
import { CmsImage } from "./CmsImage";

type Content = Site["social"];

/* Satuan milidetik: jeda sebelum kartu pertama, lama tampil, jeda antar kartu.
   Diacak tiap siklus supaya ritmenya tidak terasa seperti timer. */
const FIRST_DELAY: readonly [number, number] = [900, 1800];
const VISIBLE: readonly [number, number] = [4200, 5400];
const GAP: readonly [number, number] = [2400, 4800];
const OUT_MS = 380;
const STORAGE_KEY = "bsm:social-proof-dismissed";

function rand([min, max]: readonly [number, number]) {
  return Math.round(min + Math.random() * (max - min));
}

/* Urutan acak tanpa pengulangan: semua item masuk satu "dek", dikocok ulang
   saat habis. Jadi kartu tidak tampil berurutan dan tidak langsung berulang. */
function shuffle(length: number) {
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/* Dibaca saat efek jalan (bukan saat render) supaya aman untuk SSR. */
function wasDismissed() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function TicketIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path
        d="M3 9.6V7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5v2.1a2.4 2.4 0 000 4.8v2.1a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 16.5v-2.1a2.4 2.4 0 000-4.8z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 6.6v1.9M14.5 11v2M14.5 15.5v1.9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Pembelian tiket palsu di kiri bawah: muncul — tampil beberapa detik —
 * menghilang — jeda acak — kartu berikutnya, terus berputar.
 * Isi (foto dan nama pembeli) datang dari CMS, bukan hard-coded.
 */
export default function SocialProof({ content }: { content: Content }) {
  const items = content.items ?? [];
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"idle" | "in" | "out">("idle");
  const [visibleMs, setVisibleMs] = useState(VISIBLE[1]);
  const [dismissed, setDismissed] = useState(false);
  const paused = useRef(false);

  useEffect(() => {
    if (dismissed || wasDismissed() || items.length === 0) return;
    let stopped = false;
    const timers: number[] = [];
    let deck: number[] = [];
    let cursor = 0;

    const nextIndex = () => {
      if (cursor >= deck.length) {
        const previous = deck[deck.length - 1];
        deck = shuffle(items.length);
        // Hindari kartu yang sama tampil dua kali beruntun saat dek berganti.
        if (deck.length > 1 && deck[0] === previous) {
          const swap = 1 + Math.floor(Math.random() * (deck.length - 1));
          [deck[0], deck[swap]] = [deck[swap], deck[0]];
        }
        cursor = 0;
      }
      return deck[cursor++];
    };

    const show = () => {
      if (stopped) return;
      const ms = rand(VISIBLE);
      setIndex(nextIndex());
      setVisibleMs(ms);
      setPhase("in");

      const hide = () => {
        if (stopped) return;
        if (paused.current) {
          // Sedang di-hover: tahan, coba lagi sebentar lagi.
          timers.push(window.setTimeout(hide, 700));
          return;
        }
        setPhase("out");
        timers.push(
          window.setTimeout(() => {
            if (stopped) return;
            setPhase("idle");
            timers.push(window.setTimeout(show, rand(GAP)));
          }, OUT_MS),
        );
      };

      timers.push(window.setTimeout(hide, ms));
    };

    timers.push(window.setTimeout(show, rand(FIRST_DELAY)));

    return () => {
      stopped = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [dismissed, items.length]);

  function dismiss() {
    setDismissed(true);
    setPhase("idle");
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* abaikan */
    }
  }

  if (dismissed || phase === "idle" || items.length === 0) return null;

  const item = items[index] ?? items[0];

  return (
    <aside
      id="social"
      aria-label="Pembelian tiket terbaru"
      className="pointer-events-none fixed bottom-3 left-3 z-40 w-[min(16.5rem,calc(100vw-1.5rem))] sm:bottom-5 sm:left-5 sm:w-[min(21rem,calc(100vw-2.5rem))]"
    >
      <div
        onMouseEnter={() => {
          paused.current = true;
        }}
        onMouseLeave={() => {
          paused.current = false;
        }}
        className={`pointer-events-auto relative overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_16px_40px_rgba(11,14,22,0.18)] ${
          phase === "in" ? "animate-proof-in" : "animate-proof-out"
        }`}
      >
        {/* Sisa waktu tampil — mengikuti durasi acak kartu ini */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gekraf-surface">
          <div
            className="proof-bar h-full w-full bg-gekraf-gold"
            style={{ animationDuration: `${visibleMs}ms` }}
          />
        </div>

        <div className="flex items-center gap-2 px-3 pt-3 pb-0.5 sm:px-4 sm:pt-3.5 sm:pb-1">
          <span className="proof-dot h-1.5 w-1.5 shrink-0 rounded-full bg-[#22C55E] sm:h-2 sm:w-2" />
          <p className="min-w-0 flex-1 truncate text-[10px] font-extrabold tracking-[0.12em] text-gekraf-cyan uppercase sm:text-[11.5px] sm:tracking-[0.16em]">
            {content.badge}
          </p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Tutup notifikasi pembelian"
            className="-mr-1.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-gekraf-muted transition-colors hover:bg-gekraf-surface hover:text-gekraf-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gekraf-cyan"
          >
            <svg
              viewBox="0 0 16 16"
              aria-hidden="true"
              className="h-3.5 w-3.5"
              fill="none"
            >
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2.5 px-3 pt-1 pb-2.5 sm:gap-3.5 sm:px-4 sm:pt-1.5 sm:pb-3.5">
          <div className="relative h-9 w-9 shrink-0 sm:h-13 sm:w-13">
            <CmsImage
              src={item.src}
              alt={item.name}
              width={56}
              height={56}
              className="h-9 w-9 rounded-full object-cover ring-2 ring-gekraf-cyan/15 sm:h-13 sm:w-13"
            />
            <span className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#22C55E] ring-2 ring-white sm:h-4.5 sm:w-4.5">
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="sm:h-[10px] sm:w-[10px]">
                <path
                  d="M2.5 6.2l2.3 2.3 4.7-4.8"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <p className="min-w-0 truncate text-[14px] leading-tight font-bold text-gekraf-ink sm:text-[17px]">
            {item.name}
          </p>
        </div>

        <div className="px-3 pb-3 sm:px-4 sm:pb-4">
          <p className="inline-flex max-w-full items-center gap-1 rounded-full bg-gekraf-gold px-2.5 py-1 text-[10px] font-extrabold tracking-[0.08em] text-gekraf-ink uppercase sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-[11.5px] sm:tracking-[0.1em]">
            <TicketIcon />
            <span className="min-w-0 truncate">{content.line}</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
