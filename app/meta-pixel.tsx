"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded?: boolean;
  version?: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

const started = new Set<string>();

function install(pixelId: string) {
  if (started.has(pixelId)) return;
  started.add(pixelId);
  if (window.fbq) {
    window.fbq("init", pixelId);
    window.fbq("track", "PageView");
    return;
  }
  const fbq = function (this: unknown, ...args: unknown[]) {
    const queued = fbq as Fbq;
    if (queued.callMethod) queued.callMethod(...args);
    else queued.queue.push(args);
  } as Fbq;
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  window.fbq = fbq;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);
  fbq("init", pixelId);
  fbq("track", "PageView");
}

export function MetaPixel({ pixelId }: { pixelId: string }) {
  const path = usePathname();
  const hidden = path.startsWith("/dashboard") || path.startsWith("/login");

  useEffect(() => {
    if (hidden || !/^\d{5,20}$/.test(pixelId)) return;
    install(pixelId);
  }, [hidden, pixelId]);

  return null;
}

export function MetaEvent({
  name,
  eventId,
  value,
  contentName,
}: {
  name: "InitiateCheckout" | "Lead";
  eventId: string;
  value?: number;
  contentName?: string;
}) {
  useEffect(() => {
    const key = `meta:${name}:${eventId}`;
    if (sessionStorage.getItem(key)) return;
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (!window.fbq) {
        if (tries > 20) window.clearInterval(timer);
        return;
      }
      const data: Record<string, string | number> = { currency: "IDR" };
      if (value && value > 0) data.value = value;
      if (contentName) data.content_name = contentName;
      window.fbq("track", name, data, { eventID: eventId });
      sessionStorage.setItem(key, "1");
      window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [name, eventId, value, contentName]);

  return null;
}
