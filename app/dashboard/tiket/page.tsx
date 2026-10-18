import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdmin } from "@/lib/auth";
import { getSite } from "@/lib/site";
import { getTicketSettings } from "@/lib/ticket-settings";
import {
  saveTicketSettingsAction,
  sendTestTicketEmailAction,
} from "@/lib/actions";
import { greeting, todayLine } from "../greeting";
import { Flash } from "@/app/toast";
import { Card, Field, Icon, PageHead, Pill, btnClass, inputClass } from "../ui";
import { PendingButton } from "@/app/submit";

export default function TicketCMSPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; tested?: string; error?: string }>;
}) {
  return (
    <Suspense fallback={<TicketCMSFallback />}>
      <TicketCMS searchParams={searchParams} />
    </Suspense>
  );
}

function TicketCMSFallback() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true">
      <div className="h-6 w-52 rounded-lg bg-dash-line-soft" />
      <div className="h-96 rounded-[14px] border border-dash-line bg-dash-surface" />
    </div>
  );
}

async function TicketCMS({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; tested?: string; error?: string }>;
}) {
  const query = await searchParams;
  const admin = await getAdmin();
  if (!admin) redirect("/login");

  const [site, settings] = await Promise.all([getSite(), getTicketSettings()]);

  return (
    <div className="flex flex-col gap-5">
      <PageHead
        date={todayLine()}
        title={`${greeting()}, ${admin?.username ?? "admin"}`}
        sub="Atur tampilan email tiket customer, upload pamflet acara, serta sesuaikan teks sambutan dan panduan registrasi."
      />

      <Flash
        items={[
          query.saved === "1"
            ? {
                tone: "ok" as const,
                text: "Pengaturan dan desain tiket email berhasil disimpan.",
              }
            : null,
          query.tested === "1"
            ? {
                tone: "ok" as const,
                text: "Email uji coba tiket berhasil dikirim! Silakan periksa inbox Anda.",
              }
            : null,
          query.error ? { tone: "off" as const, text: query.error } : null,
        ].filter((item) => item !== null)}
      />

      {/* QUICK PREVIEW BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dash-fill/30 bg-gradient-to-r from-dash-soft via-white to-dash-surface p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-dash-fill text-white shadow-xs">
            <Icon name="eye" className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[15px] font-bold text-dash-ink">
              Pratinjau Email Tiket (Tampilan Penuh)
            </h2>
            <p className="text-[12.5px] text-dash-muted">
              Lihat tampilan email customer secara leluasa dalam ukuran Desktop, Mobile, atau Layar Penuh.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/tiket/preview"
            target="_blank"
            className={`${btnClass("primary", "md")} gap-2 shadow-xs`}
          >
            <Icon name="external" className="h-4 w-4" />
            <span>Buka Preview di Tab Baru</span>
          </Link>
          <Link
            href="/dashboard/tiket/preview"
            className={`${btnClass("outline", "md")}`}
          >
            <span>Buka di Sini</span>
          </Link>
        </div>
      </div>

      {/* MAIN SETTINGS FORM (Spacious Full Width) */}
      <Card padded>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-dash-line-soft pb-4">
          <div className="flex items-center gap-2.5">
            <Icon name="ticket" className="h-5 w-5 text-dash-fill" />
            <div>
              <h2 className="text-[16px] font-bold text-dash-ink">
                Formulir Pengaturan & Konten Tiket
              </h2>
              <p className="text-[12.5px] text-dash-muted">
                Perubahan pada formulir ini akan langsung diterapkan ke email tiket yang dikirim ke peserta.
              </p>
            </div>
          </div>
          <Pill tone="ok">Aktif & Terhubung</Pill>
        </div>

        <form action={saveTicketSettingsAction} className="flex flex-col gap-6">
          {/* Section 1: Event Identity */}
          <div>
            <h3 className="mb-3 text-[13px] font-extrabold tracking-wider text-dash-muted uppercase">
              1. Identitas Acara & Branding
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Field
                id="eventTitle"
                label="Judul Acara / Event"
                required
                hint="Nama utama acara di tiket."
              >
                <input
                  id="eventTitle"
                  name="eventTitle"
                  required
                  defaultValue={settings.eventTitle}
                  className={inputClass}
                  placeholder="BUSINESS SKILL MASTERY"
                />
              </Field>

              <Field
                id="eventSubtitle"
                label="Subjudul / Tagline"
                hint="Keterangan singkat di bawah judul."
              >
                <input
                  id="eventSubtitle"
                  name="eventSubtitle"
                  defaultValue={settings.eventSubtitle}
                  className={inputClass}
                  placeholder="Solusi In This Economy · Exclusive Masterclass"
                />
              </Field>

              <Field
                id="badge"
                label="Label Badge Tiket"
                hint="Pita status paling atas."
              >
                <input
                  id="badge"
                  name="badge"
                  defaultValue={settings.badge}
                  className={inputClass}
                  placeholder="E-TIKET RESMI · VIP PASS"
                />
              </Field>
            </div>
          </div>

          {/* Section 2: Pamflet Image Section */}
          <div className="border-t border-dash-line-soft pt-5">
            <h3 className="mb-3 text-[13px] font-extrabold tracking-wider text-dash-muted uppercase">
              2. Pamflet Acara (Email Tiket)
            </h3>

            <div className="rounded-[14px] border border-dash-line bg-dash-bg p-4 sm:p-5">
              <div className="flex flex-wrap items-start gap-5">
                {/* Current Image Thumbnail */}
                <div className="relative h-36 w-28 shrink-0 overflow-hidden rounded-xl border border-dash-line bg-dash-surface shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={settings.pamphletUrl}
                    alt="Pamflet aktif"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-dash-ink/70 py-1 text-center text-[10px] font-bold text-white">
                    Aktif
                  </div>
                </div>

                <div className="flex-1 min-w-[260px] space-y-3.5">
                  <div>
                    <h4 className="text-[13.5px] font-bold text-dash-ink">
                      Gambar Pamflet Resmi
                    </h4>
                    <p className="text-[12px] text-dash-muted leading-relaxed">
                      Pamflet ini akan ditampilkan pada email tiket customer sebagai visual utama sebelum kartu tiket VIP.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[12px] font-bold text-dash-ink mb-1.5">
                        Upload file pamflet baru:
                      </label>
                      <input
                        type="file"
                        name="pamphletFile"
                        accept="image/jpeg,image/png,image/webp"
                        className="block w-full text-[12px] text-dash-muted file:mr-3 file:rounded-lg file:border-0 file:bg-dash-fill file:px-3 file:py-2 file:text-[12px] file:font-bold file:text-white hover:file:opacity-90"
                      />
                      <span className="mt-1 block text-[11px] text-dash-muted">
                        Format JPG, PNG, atau WebP (maks. 4MB)
                      </span>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-dash-ink mb-1.5">
                        Atau gunakan path URL:
                      </label>
                      <input
                        type="text"
                        name="pamphletUrl"
                        defaultValue={settings.pamphletUrl}
                        className={inputClass}
                        placeholder="/pamflet.jpeg"
                      />
                      <span className="mt-1 block text-[11px] text-dash-muted">
                        Bisa path lokal misal <code className="font-mono">/pamflet.jpeg</code> atau link online
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Greeting and Content */}
          <div className="border-t border-dash-line-soft pt-5">
            <h3 className="mb-3 text-[13px] font-extrabold tracking-wider text-dash-muted uppercase">
              3. Teks Sambutan & Panduan Masuk
            </h3>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field
                id="greeting"
                label="Pesan Sambutan Pembuka"
                hint="Variabel dinamis: {name} = nama peserta, {plan} = nama paket, {ticketNo} = nomor tiket."
              >
                <textarea
                  id="greeting"
                  name="greeting"
                  rows={3}
                  defaultValue={settings.greeting}
                  className={`${inputClass} min-h-[80px] resize-y py-2.5 text-[13px] leading-relaxed`}
                />
              </Field>

              <Field
                id="instructions"
                label="Panduan & Syarat Registrasi (1 baris per poin)"
                hint="Setiap baris akan ditampilkan sebagai checklist nomor terurut di email."
              >
                <textarea
                  id="instructions"
                  name="instructions"
                  rows={4}
                  defaultValue={settings.instructions.join("\n")}
                  className={`${inputClass} min-h-[96px] font-mono text-[12.5px] leading-relaxed resize-y py-2.5`}
                />
              </Field>
            </div>
          </div>

          {/* Section 4: Contact & Organizer */}
          <div className="border-t border-dash-line-soft pt-5">
            <h3 className="mb-3 text-[13px] font-extrabold tracking-wider text-dash-muted uppercase">
              4. Kontak Bantuan & Penyelenggara
            </h3>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                id="supportWhatsapp"
                label="Nomor WhatsApp Panitia"
                hint="Awali dengan 62 (contoh: 6282221768800)."
              >
                <input
                  id="supportWhatsapp"
                  name="supportWhatsapp"
                  defaultValue={settings.supportWhatsapp}
                  className={inputClass}
                  placeholder="6282221768800"
                />
              </Field>

              <Field
                id="supportLabel"
                label="Label Tombol WhatsApp"
                hint="Teks pada tombol bantuan di email."
              >
                <input
                  id="supportLabel"
                  name="supportLabel"
                  defaultValue={settings.supportLabel}
                  className={inputClass}
                  placeholder="Hubungi Panitia via WhatsApp"
                />
              </Field>

              <Field
                id="organizer"
                label="Nama Penyelenggara"
                hint="Tertera pada footer tiket."
              >
                <input
                  id="organizer"
                  name="organizer"
                  defaultValue={settings.organizer}
                  className={inputClass}
                  placeholder="DPD GEKRAF Jawa Tengah × Jaggad Academy"
                />
              </Field>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-dash-line-soft pt-5">
            <Link
              href="/dashboard/tiket/preview"
              target="_blank"
              className={`${btnClass("outline", "md")} gap-1.5`}
            >
              <Icon name="external" className="h-4 w-4" />
              <span>Lihat Preview di Tab Baru</span>
            </Link>

            <PendingButton className={`${btnClass("primary", "md")} px-6`}>
              <Icon name="check" className="h-4 w-4" />
              <span>Simpan Perubahan Tiket</span>
            </PendingButton>
          </div>
        </form>
      </Card>

      {/* TEST SEND EMAIL CARD */}
      <Card padded>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-dash-bg text-dash-muted">
              <Icon name="mail" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-[14.5px] font-bold text-dash-ink">
                Kirim Uji Coba Email Tiket
              </h3>
              <p className="text-[12.5px] text-dash-muted">
                Kirim sampel email tiket ke alamat email Anda untuk mengecek hasil render di aplikasi email HP/komputer.
              </p>
            </div>
          </div>

          <form action={sendTestTicketEmailAction} className="flex flex-wrap items-center gap-2.5">
            <input
              type="email"
              name="to"
              required
              placeholder="nama@email-anda.com"
              className={`${inputClass} w-64`}
            />
            <PendingButton className={btnClass("outline", "md")}>
              <Icon name="mail" className="h-4 w-4" />
              <span>Kirim Tes Email</span>
            </PendingButton>
          </form>
        </div>
      </Card>
    </div>
  );
}
