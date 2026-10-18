"use client";

import { useEffect, useRef, useState } from "react";

export type ToastTone = "ok" | "warn" | "off";

type ToastItem = { id: number; tone: ToastTone; text: string };

let nextId = 1;
let emit: (item: ToastItem) => void = () => {};
let lastSig = "";
let lastAt = 0;

export function toast(tone: ToastTone, text: string) {
  const sig = `${tone}:${text}`;
  const now = Date.now();
  if (sig === lastSig && now - lastAt < 800) return;
  lastSig = sig;
  lastAt = now;
  emit({ id: nextId++, tone, text });
}

export function clearFlashParams() {
  const url = new URL(window.location.href);
  let changed = false;
  for (const name of ["saved", "error", "warn", "sent", "probe"]) {
    if (!url.searchParams.has(name)) continue;
    url.searchParams.delete(name);
    changed = true;
  }
  if (changed) window.history.replaceState(null, "", `${url.pathname}${url.search}`);
}

export function Flash({ items }: { items: { tone: string; text: string }[] }) {
  const key = items.map((item) => `${item.tone}:${item.text}`).join("\n");
  const seen = useRef("");

  useEffect(() => {
    if (!key || seen.current === key) return;
    seen.current = key;
    for (const item of items) toast(item.tone as ToastTone, item.text);
    clearFlashParams();
  }, [key, items]);

  return null;
}

export function ToastViewport() {
  const [items, setItems] = useState<ToastItem[]>([]);

  emit = (item) => {
    setItems((list) => [...list, item]);
    window.setTimeout(() => {
      setItems((list) => list.filter((entry) => entry.id !== item.id));
    }, 3000);
  };

  if (items.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-20 right-4 z-30 flex w-[min(22rem,calc(100%-2rem))] flex-col gap-2 lg:right-6 lg:w-[min(22rem,calc(100%-19rem))]"
      aria-live="polite"
    >
      {items.map((item) => (
        <p
          key={item.id}
          role={item.tone === "off" ? "alert" : "status"}
          className={`pointer-events-auto rounded-[12px] border px-3.5 py-2.5 text-[13.5px] leading-snug font-semibold ${
            item.tone === "ok"
              ? "border-[#b7dfc4] bg-dash-ok-bg text-dash-ok-fg"
              : item.tone === "warn"
                ? "border-[#ead7b0] bg-dash-warn-bg text-dash-warn-fg"
                : "border-[#f0c2be] bg-dash-off-bg text-dash-off-fg"
          }`}
        >
          {item.text}
        </p>
      ))}
    </div>
  );
}
