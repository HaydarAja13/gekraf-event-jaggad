import Link from "next/link";
import { CmsImage } from "@/app/components/CmsImage";
import type { Site } from "@/lib/types";
import { WhatsAppIcon } from "./icons";

/*
  The checkout bar. The landing Navbar's anchors all point at landing sections,
  so on /checkout the bar keeps only two jobs: back to the full story, and a
  human on WhatsApp for anyone stuck mid-payment.
*/
export function CheckoutTopbar({
  navbar,
  cta,
}: {
  navbar: Site["navbar"];
  cta: Site["cta"];
}) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white">
      <div className="mx-auto flex h-[68px] w-[95%] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-gekraf-cyan/50"
          aria-label={`${navbar.brand} — kembali ke beranda`}
        >
          <CmsImage
            src={navbar.logoSrc || "/logo.png"}
            alt=""
            width={3375}
            height={4219}
            className="h-9 w-auto shrink-0 object-contain lg:h-10"
            priority
          />
          <span className="hidden truncate text-[15px] font-bold tracking-[0.06em] text-gekraf-ink uppercase sm:inline lg:text-[16px]">
            {navbar.brand}
          </span>
        </Link>

        <a
          href={cta.whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-gekraf-gold px-4 py-2.5 text-[14px] font-extrabold text-gekraf-ink shadow-[0_6px_18px_rgba(242,203,25,0.28)] transition hover:bg-gekraf-gold-bright focus-visible:ring-2 focus-visible:ring-gekraf-cyan/50 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-5 sm:text-[15px]"
        >
          <WhatsAppIcon size={17} />
          Hubungi panitia
          <span className="sr-only"> via WhatsApp {cta.whatsappNumber}</span>
        </a>
      </div>
    </header>
  );
}
