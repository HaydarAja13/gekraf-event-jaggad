import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getSite } from "@/lib/site";
import Navbar from "@/app/components/Navbar";
import { MetaEvent } from "@/app/meta-pixel";
import { TicketFrame } from "../ticket";
import { WhatsAppIcon } from "../icons";

export const metadata: Metadata = {
  title: "Pendaftaran Terkirim — Business Skill Mastery",
  description: "Pendaftaran tiket Anda sudah masuk dan menunggu verifikasi panitia.",
  robots: { index: false, follow: false },
};

const steps = [
  {
    title: "Simpan nomor tiket",
    body: "Nomor unik sudah terbit saat pendaftaran. Simpan nomor ini. Tautan tiket dikirim ke email begitu pembayaran dikonfirmasi.",
  },
  {
    title: "Tunjukkan saat check-in",
    body: "Setelah pembayaran dikonfirmasi, tiket bisa diunduh. Tunjukkan nomor tiket ke panitia di lokasi acara.",
  },
  {
    title: "Hubungi panitia bila perlu",
    body: "Belum menerima email padahal pembayaran sudah masuk? Hubungi panitia dengan bukti transfer Anda.",
  },
];

export default function SentPage({
  searchParams,
}: {
  searchParams: Promise<{ tiket?: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gekraf-surface" />}>
      <SentContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SentContent({
  searchParams,
}: {
  searchParams: Promise<{ tiket?: string }>;
}) {
  const [{ tiket }, site] = await Promise.all([searchParams, getSite()]);
  const code = tiket && /^BSM-[0-9A-Z]+$/.test(tiket) ? tiket : "";

  return (
    <>
      <Navbar content={site.navbar} links={false} />
      {code ? <MetaEvent name="Lead" eventId={code} /> : null}
      <main className="relative flex-1 bg-gekraf-surface">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[380px] bg-gradient-to-b from-[#d9eff7] via-[#e9f4f8] to-transparent"
        />
        <div className="relative mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <TicketFrame site={site}>
            <section className="min-w-0 border-t-2 border-dashed border-[#d3dde2] px-5 py-8 sm:px-7 lg:border-t-0 lg:border-l-2 lg:px-[34px] lg:py-[34px]">
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
                <div className="min-w-0">
                  <span className="inline-flex rounded-full border border-[#cfe9f1] bg-[#e8f6fa] px-3.5 py-1.5 text-[13px] font-extrabold tracking-[0.08em] text-[#016b86]">
                    Menunggu verifikasi
                  </span>
                  <h1 className="mt-4 max-w-[18ch] font-serif text-[clamp(1.8rem,3vw,2.25rem)] leading-[1.08] font-extrabold tracking-[-0.01em] text-gekraf-ink">
                    Pendaftaran Anda sudah masuk.
                  </h1>
                  <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-gekraf-muted">
                    Bukti pembayaran sudah kami terima. Nomor tiket Anda sudah terbit. Tautan tiket dikirim ke email
                    setelah panitia mengonfirmasi pembayaran.
                  </p>
                  {code ? (
                    <p className="mt-5">
                      <span className="block text-[12px] font-extrabold tracking-[0.14em] text-gekraf-muted">
                        NOMOR TIKET
                      </span>
                      <span className="mt-1 block text-[2rem] leading-none font-extrabold tracking-[0.04em] text-gekraf-ink">
                        {code}
                      </span>
                    </p>
                  ) : null}
                </div>
                <span
                  aria-hidden
                  className="animate-stamp-in -rotate-6 rounded-xl border-[3px] border-gekraf-cyan/40 px-4 py-2 text-[16px] font-extrabold tracking-[0.28em] text-gekraf-cyan/80 select-none"
                >
                  TERKIRIM
                </span>
              </div>

              <ol className="mt-8 grid gap-5 sm:grid-cols-3">
                {steps.map((step, index) => (
                  <li key={step.title}>
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-gekraf-cyan text-[15px] font-extrabold text-white">
                      {index + 1}
                    </span>
                    <h2 className="mt-3 text-[15.5px] font-extrabold text-gekraf-ink">{step.title}</h2>
                    <p className="mt-1.5 text-[14px] leading-relaxed text-gekraf-muted">{step.body}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-[#d6e9f0] bg-[#f4fbfd] px-4 py-3.5 sm:px-5">
                <p className="text-[14px] leading-relaxed text-gekraf-muted">
                  Belum menerima email? Cek juga folder spam dan promosi, lalu hubungi panitia jika tetap belum ada.
                </p>
                <a
                  href={site.cta.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-2 rounded-full border border-gekraf-cyan/30 bg-white px-4 py-2 text-[13.5px] font-bold text-gekraf-cyan-deep transition hover:border-gekraf-cyan/60 hover:bg-[#e8f6fa] focus-visible:ring-2 focus-visible:ring-gekraf-cyan/40 focus-visible:outline-none"
                >
                  <WhatsAppIcon size={15} />
                  {site.cta.whatsappNumber}
                </a>
              </div>

              <Link
                href="/"
                className="mt-6 inline-flex items-center gap-1.5 text-[14.5px] font-bold text-gekraf-cyan-deep underline decoration-gekraf-cyan/40 underline-offset-2 transition hover:text-gekraf-cyan"
              >
                <span aria-hidden>←</span>
                Kembali ke beranda
              </Link>
            </section>
          </TicketFrame>
          <p className="mt-10 text-center text-[13px] leading-relaxed text-gekraf-muted">
            {site.navbar.brand} · {site.hero.date} · {site.hero.venue}
          </p>
        </div>
      </main>
    </>
  );
}
