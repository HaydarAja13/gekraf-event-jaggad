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

const PIXEL_RE = /^\d{5,20}$/;

const started = new Set<string>();

/** Base code Meta Pixel, dimasukkan langsung ke HTML server agar jalan sebelum hydration. */
function baseCode(pixelId: string) {
  return `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;
}

function install(pixelId: string) {
  if (started.has(pixelId)) return;
  started.add(pixelId);
  // Base code dari server sudah menginisialisasi fbq — jangan dobel PageView.
  if (window.fbq) return;
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
  const valid = PIXEL_RE.test(pixelId);

  useEffect(() => {
    if (hidden || !valid) return;
    install(pixelId);
  }, [hidden, valid, pixelId]);

  if (hidden || !valid) return null;
  return (
    <>
      <script id="meta-pixel" dangerouslySetInnerHTML={{ __html: baseCode(pixelId) }} />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
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
