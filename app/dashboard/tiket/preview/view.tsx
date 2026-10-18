"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon, btnClass, inputClass } from "../../ui";
import { sendTestTicketEmailAction } from "@/lib/actions";
import { PendingButton } from "@/app/submit";

export function FullTicketPreview({
  html,
  eventTitle,
  pamphletUrl,
  sender,
}: {
  html: string;
  eventTitle: string;
  pamphletUrl: string;
  sender: string;
}) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile" | "full">("desktop");
  const [showTestModal, setShowTestModal] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#e9eef4] text-dash-ink">
      {/* Top Navigation & Controls Bar */}
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between border-b border-dash-line bg-dash-surface px-4 sm:px-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tiket"
            className={`${btnClass("outline", "sm")} gap-1.5`}
            title="Kembali ke formulir pengaturan"
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
            <span className="hidden sm:inline">Kembali ke Pengaturan</span>
            <span className="sm:hidden">Kembali</span>
          </Link>
          <div className="hidden h-5 w-px bg-dash-line sm:block" />
          <div>
            <h1 className="text-[14.5px] font-bold text-dash-ink leading-tight flex items-center gap-2">
              <span>Preview Email Tiket</span>
              <span className="rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[11px] font-extrabold">
                100% Sesuai Inbox
              </span>
            </h1>
            <p className="text-[12px] text-dash-muted hidden md:block">
              {eventTitle} · {pamphletUrl}
            </p>
          </div>
        </div>

        {/* Viewport Toggles & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Device Toggles */}
          <div className="flex items-center rounded-[10px] border border-dash-line bg-dash-bg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-bold transition-all ${
                viewMode === "desktop"
                  ? "bg-dash-fill text-white shadow-xs"
                  : "text-dash-muted hover:text-dash-ink"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Desktop (600px)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-bold transition-all ${
                viewMode === "mobile"
                  ? "bg-dash-fill text-white shadow-xs"
                  : "text-dash-muted hover:text-dash-ink"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">Mobile (390px)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("full")}
              className={`flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-[12px] font-bold transition-all ${
                viewMode === "full"
                  ? "bg-dash-fill text-white shadow-xs"
                  : "text-dash-muted hover:text-dash-ink"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="hidden sm:inline">Full Lebar</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTestModal(true)}
            className={`${btnClass("primary", "sm")} gap-1.5 font-bold`}
          >
            <Icon name="mail" className="h-4 w-4" />
            <span className="hidden sm:inline">Kirim Tes ke Email</span>
            <span className="sm:hidden">Tes Email</span>
          </button>
        </div>
      </header>

      {/* Test Email Modal Popup */}
      {showTestModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-dash-line bg-dash-surface p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-dash-line-soft pb-3">
              <h3 className="text-base font-bold text-dash-ink flex items-center gap-2">
                <Icon name="mail" className="h-5 w-5 text-dash-fill" />
                <span>Kirim Tes Email Tiket</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="text-dash-muted hover:text-dash-ink text-lg font-bold"
              >
                &times;
              </button>
            </div>
            <p className="mt-3 text-xs text-dash-muted leading-relaxed">
              Email uji coba akan dikirim menggunakan pengaturan dan pamflet yang sedang aktif ke inbox yang Anda tentukan.
            </p>
            <form action={sendTestTicketEmailAction} className="mt-4 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-dash-ink mb-1">
                  Alamat Email Penerima:
                </label>
                <input
                  type="email"
                  name="to"
                  required
                  placeholder="nama@email-anda.com"
                  className={inputClass}
                />
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className={btnClass("quiet", "sm")}
                >
                  Batal
                </button>
                <PendingButton className={btnClass("primary", "sm")}>
                  <Icon name="mail" className="h-4 w-4" />
                  <span>Kirim Sekarang</span>
                </PendingButton>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Main Preview Work Area */}
      <main className="flex flex-1 justify-center overflow-y-auto px-4 py-8 sm:px-8 sm:py-12">
        <div
          className={`transition-all duration-300 w-full ${
            viewMode === "mobile"
              ? "max-w-[390px]"
              : viewMode === "full"
                ? "max-w-[860px]"
                : "max-w-[620px]"
          }`}
        >
          {/* Simulated Email Client Window */}
          <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
            
            {/* Window titlebar (Mac/Outlook aesthetic) */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-xs text-slate-500">
                  Inbox — E-Tiket {eventTitle}
                </span>
              </div>
              <div className="text-[11px] font-semibold text-slate-400">
                {viewMode === "mobile" ? "Mobile Viewport (390px)" : "Desktop Viewport"}
              </div>
            </div>

            {/* Email Message Meta Header */}
            <div className="border-b border-slate-100 bg-slate-50/70 p-4 text-xs text-slate-600">
              <div className="grid gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="w-16 font-semibold text-slate-800">Dari:</span>
                  <span className="text-slate-700">{sender}</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-16 font-semibold text-slate-800">Kepada:</span>
                  <span className="text-slate-700">Ahmad Rizky Pratama &lt;peserta@example.com&gt;</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="w-16 font-semibold text-slate-800">Subjek:</span>
                  <span className="font-bold text-slate-900">
                    Tiket BSM-74829-VIP — {eventTitle}
                  </span>
                </div>
              </div>
            </div>

            {/* Rendered HTML Email Content */}
            <div
              className="bg-[#edf2f7] p-2 sm:p-6"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>
              Pratinjau ini dirender menggunakan template HTML email yang sama persis dengan yang dikirim melalui SMTP.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
