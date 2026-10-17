import type { ReactNode } from "react";
import type { Site } from "@/lib/types";
import { PosterA4 } from "./poster";

/*
  The ticket shell shared by /checkout and /checkout/terkirim: a deep-cyan
  ground holding the A4 sheet, the notched silhouette (see .ticket-punch),
  and the white body as the second grid child. On lg the sheet sticks while
  the body scrolls; below lg the ticket stacks and the seam turns horizontal.
*/
export function TicketFrame({ site, children }: { site: Site; children: ReactNode }) {
  return (
    <div className="ticket-shadow animate-ticket-in mt-5 lg:mt-6">
      <div className="ticket-frame relative">
        <div className="ticket-punch grid bg-white lg:grid-cols-[var(--ticket-stub)_minmax(0,1fr)]">
          <div className="relative bg-[#017a99]">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(110%_70%_at_50%_0%,rgba(31,168,202,0.85),transparent_65%)]"
            />
            <div className="relative p-4 lg:sticky lg:top-[88px] lg:p-4">
              <PosterA4
                hero={site.hero}
                src="/pamflet.jpeg"
                className="rounded-2xl shadow-[0_24px_48px_rgba(1,42,56,0.45)]"
              />
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
