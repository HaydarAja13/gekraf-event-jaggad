import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "../../components/Navbar";
import { orderByTicket } from "@/lib/sales";
import { getSite } from "@/lib/site";
import { getTicketSettings } from "@/lib/ticket-settings";

/** Halaman tiket memuat nama pembeli, jadi tidak boleh masuk indeks. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `E-Tiket ${code}`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default function TicketPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#070e14] text-white">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <p className="mt-3 text-sm text-cyan-200/80">Memuat tiket resmi…</p>
          </div>
        </div>
      }
    >
      <Ticket params={params} />
    </Suspense>
  );
}

async function Ticket({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [order, site, ticketSettings] = await Promise.all([
    orderByTicket(code),
    getSite(),
    getTicketSettings(),
  ]);
  if (!order || !order.ticketNo) notFound();

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(order.ticketNo)}&margin=4&color=0b1118&bgcolor=0299c3`;

  return (
    <div className="min-h-screen bg-[#060d13] text-white antialiased">
      <Navbar content={site.navbar} />

      <main className="relative px-4 py-8 sm:py-12">
        {/* Glow backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(2,153,195,0.35),transparent)]"
        />

        <div className="relative mx-auto max-w-lg">
          {/* Main Credential Ticket Card */}
          <article className="overflow-hidden rounded-3xl border-2 border-[#F2CB19] bg-[#0b131c] shadow-[0_24px_64px_rgba(0,0,0,0.6)]">
            
            {/* Header banner */}
            <div className="border-b-2 border-[#F2CB19] bg-gradient-to-r from-[#013543] via-[#017a99] to-[#0299c3] px-6 py-6 text-center">
              <span className="inline-block rounded-full border border-[#F2CB19] bg-[#F2CB19]/20 px-3.5 py-1 text-[11px] font-extrabold tracking-widest text-[#F2CB19] uppercase">
                ✦ {ticketSettings.badge || "E-TIKET RESMI · VIP PASS"} ✦
              </span>
              <h1 className="mt-2.5 text-2xl font-black tracking-tight text-white sm:text-3xl">
                {ticketSettings.eventTitle || "BUSINESS SKILL MASTERY"}
              </h1>
              <p className="mt-1 text-xs font-semibold tracking-wide text-cyan-100 sm:text-sm">
                {ticketSettings.eventSubtitle || "Solusi In This Economy · Exclusive Masterclass"}
              </p>
            </div>

            {/* Ticket Content */}
            <div className="p-6 sm:p-8">
              
              {/* Ticket number highlight box */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#F2CB19]/50 bg-[#070c12] p-4 sm:p-5">
                <div>
                  <p className="text-[10.5px] font-bold tracking-widest text-[#F2CB19] uppercase">
                    Nomor Tiket Resmi
                  </p>
                  <p className="mt-1 font-mono text-2xl font-black tracking-wider text-white sm:text-3xl">
                    {order.ticketNo}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-extrabold text-emerald-400 border border-emerald-500/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    LUNAS & TERKONFIRMASI
                  </span>
                </div>
              </div>

              {/* Grid: Participant Info & QR Code */}
              <div className="mt-6 grid gap-6 border-b border-dashed border-[#223749] pb-6 sm:grid-cols-[1fr_auto]">
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Nama Peserta
                    </p>
                    <p className="mt-0.5 text-lg font-extrabold text-white">
                      {order.fullName}
                    </p>
                    {order.institution ? (
                      <p className="text-xs text-slate-400">{order.institution}</p>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Paket Tiket
                    </p>
                    <p className="mt-0.5 text-base font-bold text-cyan-400">
                      {order.plan} · {order.amount}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Waktu Acara
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-200">
                      {site.hero.date}, {site.hero.time}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
                      Lokasi Venue
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-slate-200">
                      {site.hero.venue}, {site.hero.city}
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="rounded-xl border-2 border-[#F2CB19] bg-[#0299c3] p-2.5 shadow-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={qrUrl}
                      alt={`QR Code ${order.ticketNo}`}
                      width={140}
                      height={140}
                      className="block h-[140px] w-[140px] rounded-sm"
                    />
                  </div>
                  <p className="mt-2 text-center text-[10px] font-bold tracking-wider text-[#F2CB19] uppercase">
                    Scan untuk Check-in
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 rounded-xl border border-slate-800 bg-[#0e1722] p-4 text-xs leading-relaxed text-slate-300">
                <p className="font-bold text-white uppercase tracking-wider text-[11px] mb-1.5">
                  📌 Petunjuk Masuk Acara:
                </p>
                <ul className="list-inside list-disc space-y-1 text-slate-300">
                  <li>Tunjukkan e-tiket ini kepada petugas di meja registrasi.</li>
                  <li>Wajib membawa kartu identitas diri (KTP/SIM) yang sah.</li>
                  <li>Pintu dibuka 30 menit sebelum acara dimulai.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href={`/tiket/${order.ticketNo}/unduh`}
                  download
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#0299c3] to-[#017a99] px-5 py-3 text-sm font-extrabold text-white shadow-md transition-transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Unduh File Tiket</span>
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Kembali ke Beranda
                </Link>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t border-slate-800 bg-[#070b10] px-6 py-4 text-center text-xs text-slate-500">
              <p className="font-semibold text-slate-400">
                {ticketSettings.organizer || "DPD GEKRAF Jawa Tengah × Jaggad Academy"}
              </p>
              <p className="mt-0.5 text-[11px]">
                Tiket ini adalah tanda bukti masuk resmi yang sah.
              </p>
            </div>

          </article>
        </div>
      </main>
    </div>
  );
}
